export class DepositUseCase {
    handle(accountId: string, amount: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (amount === undefined || amount <= 0) {
                reject("Amount must be greater than zero")
            } else if (accountId === undefined) {
                reject("Must provide an account id")
            } else {
                resolve()
            }
        });
    }
}