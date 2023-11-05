import {DatabaseService} from "./DatabaseService";
import {Account} from "../model/Account";
import {createDateStr} from "../util/DateUtil";
import {DAILY_DEPOSIT_LIMIT, OVERDRAFT_LIMIT} from "../util/Constants";
import {TransactionDisallowedException} from "../model/TransactionDisallowedException";
import {DepositTransaction} from "../model/DepositTransaction";
import {TransactionCollisionException} from "../model/TransactionCollisionException";
import {WithdrawTransaction} from "../model/WithdrawTransaction";

export class AccountService {
    private readonly dbService: DatabaseService

    constructor(dbService: DatabaseService) {
        this.dbService = dbService;
    }

    async deposit(accountId: string, amount: number) {
        let depositSuccessful = false
        while (!depositSuccessful) {
            try {
                const account = await this.getAccount(accountId)
                if (this.canDeposit(account, amount)) {
                    await this.dbService.saveTransaction(
                        new DepositTransaction(accountId, account.serialNumber + 1, amount, new Date())
                    )
                    depositSuccessful = true
                } else {
                    return Promise.reject(
                        new TransactionDisallowedException(`Transaction would exceed daily deposit limit of ${DAILY_DEPOSIT_LIMIT}`)
                    )
                }
            } catch (e) {
                // Only abort if a transaction collision hasn't occurred
                if (!(e instanceof TransactionCollisionException)) return Promise.reject(e)
            }
        }
        return Promise.resolve()
    }

    async withdraw(accountId: string, amount: number) {
        let withdrawSuccessful = false
        while (!withdrawSuccessful) {
            try {
                const account = await this.getAccount(accountId)
                if (this.canWithdraw(account, amount)) {
                    await this.dbService.saveTransaction(
                        new WithdrawTransaction(accountId, account.serialNumber + 1, amount, new Date())
                    )
                    withdrawSuccessful = true
                } else {
                    return Promise.reject(
                        new TransactionDisallowedException(`Transaction would exceed overdraft limit of ${OVERDRAFT_LIMIT}`)
                    )
                }
            } catch (e) {
                // Only abort if a transaction collision hasn't occurred
                if (!(e instanceof TransactionCollisionException)) return Promise.reject(e)
            }
        }
        return Promise.resolve()
    }

    async transfer(fromAccountId: string, toAccountId: string, amount: number) {
        let transferSuccessful = false
        while (!transferSuccessful) {
            try {
                const fromAccount = await this.getAccount(fromAccountId)
                const toAccount = await this.getAccount(toAccountId)
                if (!this.canTransfer(fromAccount, amount)) {
                    return Promise.reject(
                        new TransactionDisallowedException('Unable to overdraft on transfer')
                    )
                } else if (!this.canDeposit(toAccount, amount)) {
                    return Promise.reject(
                        new TransactionDisallowedException(`Transaction would exceed daily deposit limit of ${DAILY_DEPOSIT_LIMIT}`)
                    )
                } else {
                    await this.dbService.saveTransaction(
                        new WithdrawTransaction(fromAccountId, fromAccount.serialNumber + 1, amount, new Date()),
                        new DepositTransaction(toAccountId, toAccount.serialNumber + 1, amount, new Date())
                    )
                    transferSuccessful = true
                }
            } catch (e) {
                // Only abort if a transaction collision hasn't occurred
                if (!(e instanceof TransactionCollisionException)) return Promise.reject(e)
            }
        }
        return Promise.resolve()
    }

    private async getAccount(accountId: string): Promise<Account> {
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

    private canDeposit(account: Account, amount: number): boolean {
        const todayDateStr = createDateStr(new Date())
        const todayDepositAmt = account.depositCount.get(todayDateStr) ?? 0.0
        return (todayDepositAmt + amount) <= DAILY_DEPOSIT_LIMIT
    }

    private canWithdraw(account: Account, amount: number): boolean {
        return (account.amount - amount) >= OVERDRAFT_LIMIT
    }

    private canTransfer(account: Account, amount: number): boolean {
        return (account.amount - amount) >= 0
    }
}
