import 'express-async-errors'
import express, {Request, Response, Router} from "express"
import {DepositUseCase} from "../usecases/DepositUseCase"
import {constants as httpConstants} from "http2"
import {ErrorResult} from "../model/ErrorResult";
import {InternalException} from "../model/InternalException";
import {InvalidParameterException} from "../model/InvalidParameterException";
import {AccountMissingException} from "../model/AccountMissingException";
import {TransactionDisallowedException} from "../model/TransactionDisallowedException";
import {WithdrawUseCase} from "../usecases/WithdrawUseCase";
import {TransferUseCase} from "../usecases/TransferUseCase";

type DepositRequest = Request<never, never, never, { accountId: string, amount: any }>
type WithdrawRequest = Request<never, never, never, { accountId: string, amount: any }>
type TransferRequest = Request<never, never, never, { fromAccountId: string, toAccountId: string, amount: any }>

const INTERNAL_SERVER_ERROR_MSG = "An unexpected internal error occurred"

const DEPOSIT_ENDPOINT = "/deposit"
const WITHDRAW_ENDPOINT = "/withdraw"
const TRANSFER_ENDPOINT = "/transfer"

export class TransactionRouter {
    public readonly router: Router = express.Router()

    constructor(
        depositUseCase: DepositUseCase,
        withdrawUseCase: WithdrawUseCase,
        transferUseCase: TransferUseCase
    ) {
        this.router.post(
            DEPOSIT_ENDPOINT,
            async (request: DepositRequest, response: Response) => {
                return depositUseCase.handle(request.query.accountId, request.query.amount)
                    .then(() => {
                        response.status(httpConstants.HTTP_STATUS_OK)
                        response.send()
                    }).catch((error) => {
                        this.handleError(DEPOSIT_ENDPOINT, error, response)
                    })
            }
        ).post(
            WITHDRAW_ENDPOINT,
            async (request: WithdrawRequest, response: Response) => {
                return withdrawUseCase.handle(request.query.accountId, request.query.amount)
                    .then(() => {
                        response.status(httpConstants.HTTP_STATUS_OK)
                        response.send()
                    }).catch((error) => {
                        this.handleError(WITHDRAW_ENDPOINT, error, response)
                    })
            }
        ).post(
            TRANSFER_ENDPOINT,
            async (request: TransferRequest, response: Response) => {
                return transferUseCase.handle(
                    request.query.fromAccountId,
                    request.query.toAccountId,
                    request.query.amount
                ).then(() => {
                    response.status(httpConstants.HTTP_STATUS_OK)
                    response.send()
                }).catch((error) => {
                    this.handleError(TRANSFER_ENDPOINT, error, response)
                })
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
            errorMessage = INTERNAL_SERVER_ERROR_MSG
        } else {
            console.error(`An uncaught exception occurred. Message: ${error}`)
            status = httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR
            errorMessage = INTERNAL_SERVER_ERROR_MSG
        }
        response.status(status)
        response.json(new ErrorResult(endpoint, status, errorMessage))
    }
}
