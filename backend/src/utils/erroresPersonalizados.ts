export class AppError extends Error {
    readonly statusCode: number

    constructor(message: string, statusCode: number) {
        super(message)
        this.name = this.constructor.name
        this.statusCode = statusCode
    }
}

export class ErrorDuplicado extends AppError {
    constructor(message: string) {
        super(message, 409)
    }
}

export class ErrorNoEncontrado extends AppError {
    constructor(message: string) {
        super(message, 404)
    }
}

export class IdMalFormado extends AppError {
    constructor(message: string) {
        super(message, 400)
    }
}

export class ErrorConflicto extends AppError {
    constructor(message: string) { super(message, 409) }
}
