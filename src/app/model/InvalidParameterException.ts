export class InvalidParameterException {
    public readonly parameter: string
    public readonly message: string

    constructor(parameter: string, message: string) {
        this.parameter = parameter;
        this.message = message;
    }
}