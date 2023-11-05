import {DatabaseService} from "./DatabaseService";
import {Account} from "../model/Account";

export class AccountService {
    private readonly dbService: DatabaseService

    constructor(dbService: DatabaseService) {
        this.dbService = dbService;
    }

    async getAccount(accountId: string): Promise<Account> {
        try {
            const baseAmt = await this.dbService.getAmount(accountId)
            const account = new Account(baseAmt)
            const transactions = await this.dbService.getTransactions(accountId)
            transactions.forEach((transaction) => account.addTransaction(transaction))
            return Promise.resolve(account)
        } catch (e) {
            console.error(e)
            return Promise.reject(e)
        }
    }
}
