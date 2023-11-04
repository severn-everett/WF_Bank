import {Database} from "../services/Database";
import {InvalidParameterException} from "../model/InvalidParameterException";
import {AccountMissingException} from "../model/AccountMissingException";

export class DepositUseCase {
    private readonly db: Database

    constructor(db: Database) {
        this.db = db
    }

    handle(accountId: string, amount: number): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            if (amount === undefined || amount <= 0) {
                return reject(
                    new InvalidParameterException("amount", "Amount must be greater than zero")
                )
            } else if (accountId === undefined) {
                return reject(
                    new InvalidParameterException("accountId", "Must provide an account id")
                )
            }

            const baseAmt = await this.db.getAmount(accountId)
            if (baseAmt !== null) {
                console.log(`Base amount for account ${accountId}: ${baseAmt}`)
                resolve()
            } else {
                reject(new AccountMissingException(`Account ${accountId} not found`))
            }
        });
    }
}