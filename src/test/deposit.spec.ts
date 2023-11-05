import request from "supertest"
import {constants as httpConstants} from "http2"
import app from "../app/main"
import {buildUrl, checkTransactionRows, getClient, INVALID_AMOUNT, NEGATIVE_AMOUNT} from "./testCommon"

const ENDPOINT = "/deposit"
const VALID_ACCOUNT = "testDepositAccount"
const INVALID_ACCOUNT = "nonExistentTestDepositAccount"
const VALID_AMOUNT = 500
const EXCESSIVE_AMOUNT = 5001

const client = getClient()

beforeAll(async () => {
    await client.connect()
    await resetDB()
})

beforeEach(async () => {
    await client.query({
        text: 'INSERT INTO account (id, amount) VALUES ($1, 500)',
        values: [VALID_ACCOUNT]
    })
})

afterEach(async () => {
    await resetDB()
})

afterAll(async () => {
    await app.stop()
    await client.end()
})

async function resetDB() {
    await client.query({
        text: 'DELETE FROM account WHERE id = $1',
        values: [VALID_ACCOUNT]
    })
}

describe('Deposit Test', () => {
    it('should accept a deposit for a valid account and amount', async () => {
        const response = await request(app.express).post(buildUrl(ENDPOINT, VALID_ACCOUNT, VALID_AMOUNT))
        expect(response.status).toBe(httpConstants.HTTP_STATUS_OK)
        await checkTransactionRows(client, VALID_ACCOUNT, 1)
    })

    it.each`
    accountId | amount
    ${VALID_ACCOUNT} | ${NEGATIVE_AMOUNT}
    ${VALID_ACCOUNT} | ${INVALID_AMOUNT}
    ${VALID_ACCOUNT} | ${null}
    ${null}          | ${VALID_AMOUNT}
    `("should reject a deposit with account '$accountId' and amount '$amount'", async ({accountId, amount}) => {
        const response = await request(app.express).post(buildUrl(ENDPOINT, accountId, amount))
        expect(response.status).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST)
    })

    it('should reject a deposit for a non-existent account', async () => {
        const response = await request(app.express).post(buildUrl(ENDPOINT, INVALID_ACCOUNT, VALID_AMOUNT))
        expect(response.status).toBe(httpConstants.HTTP_STATUS_NOT_FOUND)
    })

    it('should reject a deposit that exceeds the daily deposit limit', async () => {
        const response = await request(app.express).post(buildUrl(ENDPOINT, VALID_ACCOUNT, EXCESSIVE_AMOUNT))
        expect(response.status).toBe(httpConstants.HTTP_STATUS_FORBIDDEN)
    })
})
