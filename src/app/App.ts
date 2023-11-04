import express, {Express, Request, Response} from "express"
import {Server, IncomingMessage, ServerResponse} from "http"
import {TransactionRouter} from "./routers/TransactionRouter"
import {DepositUseCase} from "./usecases/DepositUseCase"
import {Database} from "./services/Database";

export class App {
    public readonly express: Express = express()
    private readonly port: Number
    private server: Server | undefined
    private readonly database: Database
    private readonly transactionRouter: TransactionRouter

    constructor(port: number) {
        this.port = port
        this.database = new Database()
        let depositUseCase = new DepositUseCase()
        this.transactionRouter = new TransactionRouter(depositUseCase)
    }

    start(): void {
        this.express.use(this.transactionRouter.router)
        this.server = this.express.listen(this.port)
    }

    async stop(): Promise<void> {
        this.server?.close()
        await this.database.shutdown()
    }
}
