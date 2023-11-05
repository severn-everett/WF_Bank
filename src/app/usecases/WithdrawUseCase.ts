import {AccountService} from "../services/AccountService";
import {InvalidParameterException} from "../model/InvalidParameterException";

export class WithdrawUseCase {
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

        return this.accountService.withdraw(accountId, amount)
    }
}