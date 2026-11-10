import type { NextFunction, Request, Response } from "express"
import { AppError } from "../utils/erroresPersonalizados.js"
import { errorResponse } from "../utils/response.utils.js"
import { Prisma } from "../../generated/prisma/client.js"

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

    // La base tambien puede rechazar una operacion aunque hayamos consultado
    // antes: otro request pudo modificar el registro justo en medio.
    //Ojo: esto no fue idea mia, sino de Claude. Lo del app error si, porque ya lo habia visto y queria practicar jeje
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
            return res.status(409).json(errorResponse("La operacion tiene un conflicto con registros relacionados. Revisa el autor, categoria o tipo de lectura; no se pueden eliminar si tienen libros."))
        }
        if (error.code === "P2002") {
            return res.status(409).json(errorResponse("Ya existe un registro con esos datos unicos."))
        }
        if (error.code === "P2025") {
            return res.status(404).json(errorResponse("No se encontro el registro solicitado."))
        }
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
