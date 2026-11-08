import type { NextFunction, Request, Response } from "express"
import { AppError } from "../utils/erroresPersonalizados.js"
import { errorResponse } from "../utils/response.utils.js"

export const manejarErrores = (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction) => {

    if (res.headersSent) {
        return next(error)
    }

    //personalizado
    if (error instanceof AppError) {
        return res.status(error.statusCode).json(errorResponse(error))
    }

    //error de mala formacion de la peticion
    if (error instanceof SyntaxError
        && "type" in error
        && error.type === "entity.parse.failed") {
        return res.status(400).json(errorResponse("El cuerpo de la peticion no es un JSON valido"))
    }

    // 500, entiendase, inesperado. Si nada de lo de arriba se cumple, 
    // entonces el error esta entre la silla y la pantalla
    console.error("Error inesperado:", error)
    return res.status(500).json(errorResponse("Error interno del servidor"))
}