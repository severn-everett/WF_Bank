import {DatabaseService} from "./DatabaseService";
import {Account} from "../model/Account";
import {createDateStr} from "../util/DateUtil";
import {DAILY_DEPOSIT_LIMIT} from "../util/Constants";

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
            console.debug('Created account:', account)
            return Promise.resolve(account)
        } catch (e) {
            console.error(e)
            return Promise.reject(e)
        }
    }

    canDeposit(account: Account, amount: number): boolean {
        const todayDateStr = createDateStr(new Date())
        const todayDepositAmt = account.depositCount.get(todayDateStr) ?? 0.0
        return (todayDepositAmt + amount) <= DAILY_DEPOSIT_LIMIT
    }
}
