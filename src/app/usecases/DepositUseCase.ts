import {InvalidParameterException} from "../model/InvalidParameterException";
import {AccountService} from "../services/AccountService";

export class DepositUseCase {
    private readonly accountService: AccountService

    constructor(accountService: AccountService) {
        this.accountService = accountService;
    }

    async handle(accountId: string, amount: number): Promise<void> {
        if (amount === undefined || amount <= 0) {
            return Promise.reject(
                new InvalidParameterException("amount", "Amount must be greater than zero")
            )
        } else if (accountId === undefined) {
            return Promise.reject(
                new InvalidParameterException("accountId", "Must provide an account id")
            )
        }

        return this.accountService.deposit(accountId, amount)
    }
}