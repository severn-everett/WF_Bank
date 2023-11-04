import request from "supertest"
import {constants as httpConstants} from "http2"
import app from "../app/main"
import {ACCOUNT_ID, AMOUNT} from "./testCommon"

const ENDPOINT = "/deposit"
const VALID_ACCOUNT = "depositAccount"
const VALID_AMOUNT = 2000
const NEGATIVE_AMOUNT = -2000
const INVALID_AMOUNT = "InvalidAmount"

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

describe('Deposit Test', () => {
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
})

afterAll(async () => {
    await app.stop()
})
