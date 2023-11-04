export class ErrorResult {
    public readonly endpoint: string
    public readonly code: number
    public readonly reason: string

    constructor(endpoint: string, code: number, reason: string) {
        this.endpoint = endpoint
        this.code = code
        this.reason = reason
    }
}
