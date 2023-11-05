import {buildUrl, checkTransactionRows, getClient, INVALID_AMOUNT, NEGATIVE_AMOUNT} from "./testCommon";
import app from "../app/main";
import request from "supertest";
import {constants as httpConstants} from "http2";
import {TransactionType} from "../app/model/TransactionType";

const ENDPOINT = "/withdraw"
const POSITIVE_BALANCE_ACCOUNT = "testWithdrawPositiveAccount"
const NEGATIVE_BALANCE_ACCOUNT = "testWithdrawNegativeAccount"
const INVALID_ACCOUNT = "nonExistentTestWithdrawAccount"
const VALID_AMOUNT = 50
const EXCESSIVE_AMOUNT = 500

const client = getClient()

beforeAll(async () => {
    await client.connect()
    await resetDB()
})

beforeEach(async () => {
    await client.query({
        text: 'INSERT INTO account (id, amount) VALUES ($1, 100), ($2, -50)',
        values: [POSITIVE_BALANCE_ACCOUNT, NEGATIVE_BALANCE_ACCOUNT]
    })
    await client.query({
        text: 'INSERT INTO transaction (account_id, type, serial_number, amount) VALUES ($1, $2, 1, 10)',
        values: [POSITIVE_BALANCE_ACCOUNT, TransactionType.WITHDRAWAL]
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
        text: 'DELETE FROM account WHERE id IN ($1, $2)',
        values: [POSITIVE_BALANCE_ACCOUNT, NEGATIVE_BALANCE_ACCOUNT]
    })
}

describe('Withdraw Test', () => {
    it.each`
    accountId                   | expectedRowCount
    ${POSITIVE_BALANCE_ACCOUNT} | ${2}
    ${NEGATIVE_BALANCE_ACCOUNT} | ${1}
    `(`should accept a withdrawal for a valid amount on account '$accountId'`, async ({accountId, expectedRowCount}) => {
        const response = await request(app.express).post(buildUrl(ENDPOINT, accountId, VALID_AMOUNT))
        expect(response.status).toBe(httpConstants.HTTP_STATUS_OK)
        await checkTransactionRows(client, accountId, expectedRowCount)
    })

    it.each`
    accountId                   | amount
    ${POSITIVE_BALANCE_ACCOUNT} | ${NEGATIVE_AMOUNT}
    ${POSITIVE_BALANCE_ACCOUNT} | ${INVALID_AMOUNT}
    ${POSITIVE_BALANCE_ACCOUNT} | ${null}
    ${null}                     | ${VALID_AMOUNT}
    `("should reject a withdrawal with account '$accountId' and amount '$amount'", async ({accountId, amount}) => {
        const response = await request(app.express).post(buildUrl(ENDPOINT, accountId, amount))
        expect(response.status).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST)
    })

    it('should reject a withdrawal for a non-existent account', async () => {
        const response = await request(app.express).post(buildUrl(ENDPOINT, INVALID_ACCOUNT, VALID_AMOUNT))
        expect(response.status).toBe(httpConstants.HTTP_STATUS_NOT_FOUND)
    })

    it('should reject a withdrawal that exceeds the overdraft limit', async () => {
        const response = await request(app.express).post(buildUrl(ENDPOINT, POSITIVE_BALANCE_ACCOUNT, EXCESSIVE_AMOUNT))
        expect(response.status).toBe(httpConstants.HTTP_STATUS_FORBIDDEN)
    })
})
