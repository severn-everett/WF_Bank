import {Pool} from "pg";

export class Database {
    private readonly pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'wfdb',
        user: 'postgres',
        password: 'postgres',
    })

    async getAmount(accountId: string): Promise<number | null> {
        const client = await this.pool.connect()
        try {
            const res = await client.query({
                text: 'SELECT amount FROM account WHERE id = $1',
                values: [accountId]
            })
            const resRow = res.rows[0]
            if (resRow) {
                return Promise.resolve(resRow.amount)
            } else {
                return Promise.resolve(null)
            }
        } finally {
            client.release()
        }
    }


    async shutdown() {
        await this.pool.end();
    }
}
