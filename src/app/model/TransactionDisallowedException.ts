export class TransactionDisallowedException {
    public readonly message: string

    constructor(message: string) {
        this.message = message;
    }
}
