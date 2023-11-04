import express, {Express} from "express"
import {Server} from "http"
import {TransactionRouter} from "./routers/TransactionRouter"
import {DepositUseCase} from "./usecases/DepositUseCase"
import {DatabaseService} from "./services/DatabaseService";
import {AccountService} from "./services/AccountService";

export class App {
    public readonly express: Express = express()
    private readonly port: Number
    private server: Server | undefined
    private readonly db: DatabaseService
    private readonly transactionRouter: TransactionRouter

    constructor(port: number) {
        this.port = port
        this.db = new DatabaseService()
        const accountService = new AccountService(this.db)
        const depositUseCase = new DepositUseCase(accountService)
        this.transactionRouter = new TransactionRouter(depositUseCase)
    }

    start(): void {
        this.express.use(this.transactionRouter.router)
        this.server = this.express.listen(this.port)
    }

    async stop(): Promise<void> {
        this.server?.close()
        await this.db.shutdown()
    }
}
