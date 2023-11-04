import express, {Express, Request, Response} from "express"
import {Server, IncomingMessage, ServerResponse} from "http"
import {TransactionRouter} from "./routers/TransactionRouter"
import {DepositUseCase} from "./usecases/DepositUseCase"

export class App {
    public readonly express: Express = express()
    private readonly port: Number
    private server: Server | undefined
    private transactionRouter: TransactionRouter

    constructor(port: number) {
        this.port = port
        let depositUseCase = new DepositUseCase()
        this.transactionRouter = new TransactionRouter(depositUseCase)
    }

    start(): void {
        this.express.use(this.transactionRouter.router)
        this.server = this.express.listen(this.port)
    }

    stop(): void {
        this.server?.close()
    }
}
