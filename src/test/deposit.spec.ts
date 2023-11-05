import request from "supertest"
import {constants as httpConstants} from "http2"
import app from "../app/main"
import {ACCOUNT_ID, AMOUNT} from "./testCommon"
import {Client} from "pg";

const ENDPOINT = "/deposit"
const VALID_ACCOUNT = "testDepositAccount"
const INVALID_ACCOUNT = "nonExistentTestDepositAccount"
const VALID_AMOUNT = 500
const EXCESSIVE_AMOUNT = 5001
const NEGATIVE_AMOUNT = -2000
const INVALID_AMOUNT = "InvalidAmount"

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'wfdb',
    user: 'postgres',
    password: 'postgres',
})

function buildUrl(accountId?: string, amount?: any): string {
    let args = []
    if (accountId) args.push(`${ACCOUNT_ID}=${accountId}`)
    if (amount) args.push(`${AMOUNT}=${amount}`)

    if (args.length > 0) {
        return `${ENDPOINT}?${args.join("&")}`
    } else {
        return ENDPOINT
    }
}

beforeAll(async () => {
    await client.connect()
})

beforeEach(async () => {
    await client.query({
        text: 'INSERT INTO account (id, amount) VALUES ($1, 500)',
        values: [VALID_ACCOUNT]
    })
})

afterEach(async () => {
    await client.query({
        text: 'DELETE FROM account WHERE id = $1',
        values: [VALID_ACCOUNT]
    })
})

afterAll(async () => {
    await app.stop()
    await client.end()
})

describe('Deposit Test', () => {
    it('should accept a deposit for a valid account and amount', async () => {
        const response = await request(app.express).post(buildUrl(VALID_ACCOUNT, VALID_AMOUNT))
        expect(response.status).toBe(httpConstants.HTTP_STATUS_OK)
    })

    it.each`
    accountId | amount
    ${VALID_ACCOUNT} | ${NEGATIVE_AMOUNT}
    ${VALID_ACCOUNT} | ${INVALID_AMOUNT}
    ${VALID_ACCOUNT} | ${null}
    ${null}          | ${VALID_AMOUNT}
    `("should reject a deposit with account '$accountId' and amount '$amount'", async ({accountId, amount}) => {
        const response = await request(app.express).post(buildUrl(accountId, amount))
        expect(response.status).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST)
    })

    it('should reject a deposit for a non-existent account', async () => {
        const response = await request(app.express).post(buildUrl(INVALID_ACCOUNT, VALID_AMOUNT))
        expect(response.status).toBe(httpConstants.HTTP_STATUS_NOT_FOUND)
    })

    it('should reject a deposit that exceeds the daily deposit limit', async () => {
        const response = await request(app.express).post(buildUrl(VALID_ACCOUNT, EXCESSIVE_AMOUNT))
        expect(response.status).toBe(httpConstants.HTTP_STATUS_FORBIDDEN)
    })
})
