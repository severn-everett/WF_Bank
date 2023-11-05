import {AccountService} from "../services/AccountService";
import {InvalidParameterException} from "../model/InvalidParameterException";

export class TransferUseCase {
    private readonly accountService: AccountService

    constructor(accountService: AccountService) {
        this.accountService = accountService;
    }

    async handle(fromAccountId: string, toAccountId: string, rawAmount: any) {
        const amount = Number(rawAmount)
        if (Number.isNaN(amount) || amount <= 0) {
            return Promise.reject(
                new InvalidParameterException("amount", "Amount must be a number greater than zero")
            )
        } else if (fromAccountId === undefined) {
            return Promise.reject(
                new InvalidParameterException("fromAccountId", "Must provide an account id")
            )
        } else if (toAccountId === undefined) {
            return Promise.reject(
                new InvalidParameterException("toAccountId", "Must provide an account id")
            )
        } else if (fromAccountId === toAccountId) {
            return Promise.reject(
                new InvalidParameterException("toAccountId", "Recipient must be a different account")
            )
        }

        return this.accountService.transfer(fromAccountId, toAccountId, rawAmount)
    }
}
