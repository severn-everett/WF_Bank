import {Client} from "pg";

export const
    ACCOUNT_ID = "accountId",
    AMOUNT = "amount",
    NEGATIVE_AMOUNT = -2000,
    INVALID_AMOUNT = "InvalidAmount"

export function getClient(): Client {
    return new Client({
        host: 'localhost',
        port: 5432,
        database: 'wfdb',
        user: 'postgres',
        password: 'postgres',
    })
}

export function buildUrl(endpoint: string, accountId?: string, amount?: any): string {
    let args = []
    if (accountId) args.push(`${ACCOUNT_ID}=${accountId}`)
    if (amount) args.push(`${AMOUNT}=${amount}`)

    if (args.length > 0) {
        return `${endpoint}?${args.join("&")}`
    } else {
        return endpoint
    }
}

export async function checkTransactionRows(client: Client, accountId: string, expectedRowCount: number) {
    const queryResult = await client.query({
        text: 'SELECT type, serial_number, amount FROM transaction WHERE account_id = $1',
        values: [accountId]
    })
    expect(queryResult.rows.length).toEqual(expectedRowCount)
}
