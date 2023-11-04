import 'express-async-errors'
import express, {Request, Response, Router} from "express"
import {query, validationResult} from "express-validator"
import {DepositUseCase} from "../usecases/DepositUseCase"
import {constants as httpConstants} from "http2"

type DepositRequest = Request<never, never, never, { accountId: string, amount: number }>
type WithdrawRequest = Request<never, never, never, { accountId: string, amount: number }>
type TransferRequest = Request<never, never, never, { fromAccountId: string, toAccountId: string, amount: number }>
const amountValidator = query('amount').isNumeric()

export class TransactionRouter {
    public readonly router: Router = express.Router()

    constructor(depositUseCase: DepositUseCase) {
        this.router.post(
            "/deposit",
            amountValidator,
            (request: DepositRequest, response: Response) => {
                const vr = validationResult(request)
                if (!vr.isEmpty()) {
                    response.status(httpConstants.HTTP_STATUS_BAD_REQUEST)
                    return response.send()
                }
                return depositUseCase.handle(
                    request.query.accountId,
                    request.query.amount
                ).then(() => {
                    response.status(httpConstants.HTTP_STATUS_OK)
                    response.send()
                }).catch((error) => {
                    response.status(httpConstants.HTTP_STATUS_BAD_REQUEST)
                    response.send()
                })
            }
        ).post("/withdraw",  (request: Request, response: Response) => {
            response.send(`Withdraw ${request.query.amount} from account ${request.query.accountId}`)
        }).post("/transfer",  (request: Request, response: Response) => {
            response.send(
                `Transfer ${request.query.amount} from account ${request.query.fromAccountId} to account ${request.query.toAccountId}`
            )
        })
    }
}
