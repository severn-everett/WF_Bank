import {AccountTransaction} from "./AccountTransaction";

export class WithdrawTransaction implements AccountTransaction {
    public readonly serialNumber: number
    public readonly amount: number
    public readonly timestamp: Date

    constructor(serialNumber: number, amount: number, timestamp: Date) {
        this.serialNumber = serialNumber
        this.amount = amount
        this.timestamp = timestamp
    }
}
