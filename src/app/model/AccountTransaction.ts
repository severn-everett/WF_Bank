import {TransactionType} from "./TransactionType";

export interface AccountTransaction {
    type: TransactionType
    accountId: string
    serialNumber: number
    amount: number
    timestamp: Date
}
