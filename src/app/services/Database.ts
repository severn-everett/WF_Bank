import {Pool} from "pg";

export class Database {
    private readonly client = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'wfdb',
        user: 'postgres',
        password: 'postgres',
    })

    async shutdown() {
        await this.client.end();
    }
}
