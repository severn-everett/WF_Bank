import {DatabaseError, Pool, PoolClient} from "pg";
import {AccountMissingException} from "../model/AccountMissingException";
import {InternalException} from "../model/InternalException";
import {AccountTransaction} from "../model/AccountTransaction";
import {DepositTransaction} from "../model/DepositTransaction";
import {WithdrawTransaction} from "../model/WithdrawTransaction";
import {TransactionType} from "../model/TransactionType";
import {TransactionCollisionException} from "../model/TransactionCollisionException";

const UNIQUE_CONSTRAINT_VIOLATION = '23505'
const TRANSACTION_KEY_CONSTRAINT = 'transaction_account_id_serial_number_key'

export class DatabaseService {
    private readonly pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'wfdb',
        user: 'postgres',
        password: 'postgres',
    })

    async getAmount(accountId: string): Promise<number> {
        try {
            const res = await this.pool.query({
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
        }
    }

    async getTransactions(accountId: string): Promise<AccountTransaction[]> {
        try {
            const res = await this.pool.query({
                text: 'SELECT type, serial_number, amount, timestamp FROM transaction WHERE account_id = $1',
                values: [accountId]
            })
            return Promise.resolve(
                res.rows.map((row) => {
                    if (row.type === TransactionType.DEPOSIT) {
                        return new DepositTransaction(
                            accountId,
                            parseInt(row.serial_number),
                            parseFloat(row.amount),
                            row.timestamp
                        )
                    } else {
                        return new WithdrawTransaction(
                            accountId,
                            parseInt(row.serial_number),
                            parseFloat(row.amount),
                            row.timestamp
                        )
                    }
                })
            );
        } catch (e) {
            console.error('A database exception occurred:', e)
            return Promise.reject(new InternalException(String(e)))
        }
    }

    async saveTransaction(...transactions: AccountTransaction[]) {
        let client: PoolClient | null = null
        try {
            client = await this.pool.connect()
            await client.query('BEGIN')
            for (let transaction of transactions) {
                console.debug('Saving transaction:', transaction)
                await client.query({
                    text: 'INSERT INTO transaction (account_id, type, serial_number, amount) VALUES ($1, $2, $3, $4)',
                    values: [transaction.accountId, transaction.type, transaction.serialNumber, transaction.amount]
                })
            }
            await client.query('COMMIT')
            return Promise.resolve()
        } catch (e) {
            await client?.query('ROLLBACK')
            if (e instanceof DatabaseError &&
                e.code === UNIQUE_CONSTRAINT_VIOLATION &&
                e.constraint === TRANSACTION_KEY_CONSTRAINT) {
                console.error('Transaction collision occurred - aborting...')
                return Promise.reject(new TransactionCollisionException())
            } else {
                console.error('A database exception occurred:', e)
                return Promise.reject(new InternalException(String(e)))
            }
        } finally {
            client?.release()
        }
    }

    async shutdown() {
        await this.pool.end();
    }
}
