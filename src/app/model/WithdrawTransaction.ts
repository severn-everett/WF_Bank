import {AccountTransaction} from "./AccountTransaction";
import {TransactionType} from "./TransactionType";

export class WithdrawTransaction implements AccountTransaction {
    public readonly type = TransactionType.WITHDRAW
    public readonly accountId: string
    public readonly serialNumber: number
    public readonly amount: number
    public readonly timestamp: Date

    constructor(accountId: string, serialNumber: number, amount: number, timestamp: Date) {
        this.accountId = accountId
        this.serialNumber = serialNumber
        this.amount = amount
        this.timestamp = timestamp
    }
}
