import express, {Request, Response, Router} from "express";

export class TransactionRouter {
    public readonly router: Router = express.Router();

    constructor() {
        this.router.post("/deposit", (request: Request, response: Response) => {
            response.send(`Deposit ${request.query.amount} to account ${request.query.accountId}`);
        }).post("/withdraw", (request: Request, response: Response) => {
            response.send(`Withdraw ${request.query.amount} from account ${request.query.accountId}`);
        }).post("/transfer", (request: Request, response: Response) => {
            response.send(
                `Transfer ${request.query.amount} from account ${request.query.fromAccountId} to account ${request.query.toAccountId}`
            );
        })
    }
}
