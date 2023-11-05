import {AccountTransaction} from "./AccountTransaction";
import {DepositTransaction} from "./DepositTransaction";
import {WithdrawTransaction} from "./WithdrawTransaction";
import {createDateStr} from "../util/DateUtil";

export class Account {
    private _amount: number
    private _serialNumber: number = 0
    public readonly depositCount: Map<string, number> = new Map<string, number>()

    constructor(amount: number) {
        this._amount = amount;
    }

    get amount(): number {
        return this._amount;
    }

    get serialNumber(): number {
        return this._serialNumber;
    }

    addTransaction(accountTransaction: AccountTransaction) {
        if (accountTransaction instanceof DepositTransaction) {
            this._amount += accountTransaction.amount
            const depositDate = createDateStr(accountTransaction.timestamp)
            const ddAmt = this.depositCount.get(depositDate) ?? 0
            this.depositCount.set(depositDate, ddAmt + accountTransaction.amount)
        } else if (accountTransaction instanceof WithdrawTransaction) {
            this._amount -= accountTransaction.amount
        }
        this._serialNumber = Math.max(this._serialNumber, accountTransaction.serialNumber)
    }
}
