import express, {Express, Request, Response} from "express";
import {Server, IncomingMessage, ServerResponse} from "http";
import {TransactionRouter} from "./routers/TransactionRouter";


export class App {
    public readonly express: Express = express();
    private readonly port: Number;
    private server: Server | undefined;
    private transactionRouter: TransactionRouter = new TransactionRouter();

    constructor(port: number) {
        this.port = port;
    }

    start(): void {
        this.express.use(this.transactionRouter.router);
        this.express.get('/dummy', (request: Request, response: Response) => {
            response.send('something!')
        });

        this.server = this.express.listen(this.port);
    }

    stop(): void {
        this.server?.close();
    }
}
