import {Pool, PoolClient} from "pg";
import {AccountMissingException} from "../model/AccountMissingException";
import {InternalException} from "../model/InternalException";
import {AccountTransaction} from "../model/AccountTransaction";
import {DepositTransaction} from "../model/DepositTransaction";
import {WithdrawTransaction} from "../model/WithdrawTransaction";

export class DatabaseService {
    private readonly pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'wfdb',
        user: 'postgres',
        password: 'postgres',
    })

    async getAmount(accountId: string): Promise<number> {
        let client: PoolClient | null = null
        try {
            client = await this.pool.connect()
            const res = await client.query({
                text: 'SELECT amount FROM account WHERE id = $1',
                values: [accountId]
            })
            const resRow = res.rows[0]
            if (resRow) {
                return Promise.resolve(parseFloat(resRow.amount))
            } else {
                return Promise.reject(new AccountMissingException(`Account ${accountId} not found`))
            }
        } catch (e) {
            console.error('A database exception occurred:', e)
            return Promise.reject(new InternalException(String(e)))
        } finally {
            client?.release()
        }
    }

    async getTransactions(accountId: string): Promise<AccountTransaction[]> {
        let client: PoolClient | null = null
        try {
            client = await this.pool.connect()
            const res = await client.query({
                text: 'SELECT type, serial_number, amount, timestamp FROM transaction WHERE account_id = $1',
                values: [accountId]
            })
            return Promise.resolve(
                res.rows.map((row) => {
                    if (row.type === 'DEPOSIT') {
                        return new DepositTransaction(parseInt(row.serial_number), parseFloat(row.amount), row.timestamp)
                    } else {
                        return new WithdrawTransaction(parseInt(row.serial_number), parseFloat(row.amount), row.timestamp)
                    }
                })
            );
        } catch (e) {
            console.error('A database exception occurred:', e)
            return Promise.reject(new InternalException(String(e)))
        } finally {
            client?.release()
        }
    }

    async shutdown() {
        await this.pool.end();
    }
}
