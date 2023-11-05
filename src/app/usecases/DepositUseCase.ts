import {InvalidParameterException} from "../model/InvalidParameterException";
import {AccountService} from "../services/AccountService";

export class DepositUseCase {
    private readonly accountService: AccountService

    constructor(accountService: AccountService) {
        this.accountService = accountService;
    }

    async handle(accountId: string, rawAmount: any): Promise<void> {
        const amount = Number(rawAmount)
        if (Number.isNaN(amount) || amount <= 0) {
            return Promise.reject(
                new InvalidParameterException("amount", "Amount must be a number greater than zero")
            )
        } else if (accountId === undefined) {
            return Promise.reject(
                new InvalidParameterException("accountId", "Must provide an account id")
            )
        }

        return this.accountService.deposit(accountId, amount)
    }
}