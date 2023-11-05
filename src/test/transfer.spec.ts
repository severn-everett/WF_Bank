import {AMOUNT, checkTransactionRows, getClient, INVALID_AMOUNT, NEGATIVE_AMOUNT} from "./testCommon";
import app from "../app/main";
import request from "supertest";
import {constants as httpConstants} from "http2";
import {TransactionType} from "../app/model/TransactionType";

const ENDPOINT = "/transfer"
const VALID_FROM_ACCOUNT = "testTransferFromAccount"
const OVERDRAWN_FROM_ACCOUNT = "testTransferOverdrawnAccount"
const VALID_TO_ACCOUNT = "testTransferToAccount"
const INVALID_ACCOUNT = "nonExistentTestTransferAccount"
const VALID_AMOUNT = 100
const EXCESSIVE_AMOUNT = 5001

const client = getClient()

beforeAll(async () => {
    await client.connect()
    await resetDB()
})

beforeEach(async () => {
    await client.query({
        text: 'INSERT INTO account (id, amount) VALUES ($1, 10000), ($2, 50), ($3, 500)',
        values: [VALID_FROM_ACCOUNT, OVERDRAWN_FROM_ACCOUNT, VALID_TO_ACCOUNT]
    })
    await client.query({
        text: 'INSERT INTO transaction (account_id, type, serial_number, amount) VALUES ($1, $2, 1, 50)',
        values: [VALID_FROM_ACCOUNT, TransactionType.WITHDRAWAL]
    })
})

afterEach(async () => {
    await resetDB()
})

afterAll(async () => {
    await app.stop()
    await client.end()
})

function buildUrl(fromAccountId?: string, toAccountId?: string, amount?: any): string {
    let args = []
    if (fromAccountId) args.push(`fromAccountId=${fromAccountId}`)
    if (toAccountId) args.push(`toAccountId=${toAccountId}`)
    if (amount) args.push(`${AMOUNT}=${amount}`)

    if (args.length > 0) {
        return `${ENDPOINT}?${args.join("&")}`
    } else {
        return ENDPOINT
    }
}

async function resetDB() {
    await client.query({
        text: 'DELETE FROM account WHERE id IN ($1, $2, $3)',
        values: [VALID_FROM_ACCOUNT, OVERDRAWN_FROM_ACCOUNT, VALID_TO_ACCOUNT]
    })
}

describe('Transfer Test', () => {
    it('should accept a transfer between valid accounts for a valid amount', async () => {
        const response = await request(app.express).post(buildUrl(VALID_FROM_ACCOUNT, VALID_TO_ACCOUNT, VALID_AMOUNT))
        expect(response.status).toBe(httpConstants.HTTP_STATUS_OK)
        await checkTransactionRows(client, VALID_FROM_ACCOUNT, 2)
        await checkTransactionRows(client, VALID_TO_ACCOUNT, 1)
    })

    it.each`
    fromAccountId         | toAccountId           | amount
    ${VALID_FROM_ACCOUNT} | ${VALID_TO_ACCOUNT}   | ${NEGATIVE_AMOUNT}
    ${VALID_FROM_ACCOUNT} | ${VALID_FROM_ACCOUNT} | ${VALID_AMOUNT}
    ${VALID_FROM_ACCOUNT} | ${VALID_TO_ACCOUNT}   | ${INVALID_AMOUNT}
    ${VALID_FROM_ACCOUNT} | ${VALID_TO_ACCOUNT}   | ${null}
    ${null}               | ${VALID_TO_ACCOUNT}   | ${VALID_AMOUNT}
    ${VALID_FROM_ACCOUNT} | ${null}               | ${VALID_AMOUNT}
    `(
        "should reject a transfer from account '$fromAccountId' to '$toAccountId' for amount '$amount'",
        async ({fromAccountId, toAccountId, amount}) => {
            const response = await request(app.express).post(buildUrl(fromAccountId, toAccountId, amount))
            expect(response.status).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST)
        }
    )

    it.each`
    fromAccountId         | toAccountId
    ${INVALID_ACCOUNT}    | ${VALID_TO_ACCOUNT}
    ${VALID_FROM_ACCOUNT} | ${INVALID_ACCOUNT}
    `(
        "should reject a transfer from '$fromAccountId' to '$toAccountId' due to a non-existent account",
        async ({fromAccountId, toAccountId}) => {
            const response = await request(app.express).post(buildUrl(fromAccountId, toAccountId, VALID_AMOUNT))
            expect(response.status).toBe(httpConstants.HTTP_STATUS_NOT_FOUND)
        }
    )

    it.each`
    fromAccountId             | amount              | expectedRowCount
    ${OVERDRAWN_FROM_ACCOUNT} | ${VALID_AMOUNT}     | ${0}
    ${VALID_FROM_ACCOUNT}     | ${EXCESSIVE_AMOUNT} | ${1}
    `(
        "should reject a transfer from '$fromAccountId' for amount $amount due to bank business rules",
        async ({fromAccountId, amount, expectedRowCount}) => {
            const response = await request(app.express).post(buildUrl(fromAccountId, VALID_TO_ACCOUNT, amount))
            expect(response.status).toBe(httpConstants.HTTP_STATUS_FORBIDDEN)
            await checkTransactionRows(client, fromAccountId, expectedRowCount)
        }
    )
})
