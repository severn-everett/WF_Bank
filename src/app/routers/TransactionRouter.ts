import 'express-async-errors'
import express, {Request, Response, Router} from "express"
import {query, validationResult} from "express-validator"
import {DepositUseCase} from "../usecases/DepositUseCase"
import {constants as httpConstants} from "http2"
import {ErrorResult} from "../model/ErrorResult";
import {InternalException} from "../model/InternalException";
import {InvalidParameterException} from "../model/InvalidParameterException";
import {AccountMissingException} from "../model/AccountMissingException";
import {TransactionDisallowedException} from "../model/TransactionDisallowedException";

type DepositRequest = Request<never, never, never, { accountId: string, amount: number }>
type WithdrawRequest = Request<never, never, never, { accountId: string, amount: number }>
type TransferRequest = Request<never, never, never, { fromAccountId: string, toAccountId: string, amount: number }>
const amountValidator = query('amount').isNumeric()
const internalServerErrorMsg = "An unexpected internal error occurred"

export class TransactionRouter {
    public readonly router: Router = express.Router()

    constructor(depositUseCase: DepositUseCase) {
        this.router.post(
            "/deposit",
            amountValidator,
            async (request: DepositRequest, response: Response) => {
                const vr = validationResult(request)
                if (!vr.isEmpty()) {
                    return this.handleError(
                        "/deposit",
                        new InvalidParameterException("amount", "Must be numeric"),
                        response
                    )
                }
                return depositUseCase.handle(
                    request.query.accountId,
                    request.query.amount
                ).then(() => {
                    response.status(httpConstants.HTTP_STATUS_OK)
                    response.send()
                }).catch((error) => {
                    this.handleError("/deposit", error, response)
                })
            }
        ).post(
            "/withdraw",
            async (request: Request, response: Response) => {
                response.send(`Withdraw ${request.query.amount} from account ${request.query.accountId}`)
            }
        ).post(
            "/transfer",
            async (request: Request, response: Response) => {
                response.send(
                    `Transfer ${request.query.amount} from account ${request.query.fromAccountId} to account ${request.query.toAccountId}`
                )
            }
        )
    }

    private handleError(endpoint: string, error: any, response: Response) {
        let status: number
        let errorMessage: string
        if (error instanceof InvalidParameterException) {
            status = httpConstants.HTTP_STATUS_BAD_REQUEST
            errorMessage = `An invalid parameter was passed. Parameter: ${error.parameter} | Message: ${error.message}`
        } else if (error instanceof TransactionDisallowedException) {
            status = httpConstants.HTTP_STATUS_FORBIDDEN
            errorMessage = error.message
        } else if (error instanceof AccountMissingException) {
            status = httpConstants.HTTP_STATUS_NOT_FOUND
            errorMessage = error.message
        } else if (error instanceof InternalException) {
            console.error(`An exception occurred. Message: ${error.message}`)
            status = httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR
            errorMessage = internalServerErrorMsg
        } else {
            console.error(`An uncaught exception occurred. Message: ${error}`)
            status = httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR
            errorMessage = internalServerErrorMsg
        }
        response.status(status)
        response.json(new ErrorResult(endpoint, status, errorMessage))
    }
}
