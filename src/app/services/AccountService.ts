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
            const transactions = await this.dbService.getTransactions(accountId)
            return Promise.resolve(new Account(baseAmt))
        } catch (e) {
            return Promise.reject(e)
        }
    }
}
