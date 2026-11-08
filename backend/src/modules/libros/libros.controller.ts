import { type Request, type Response } from "express";
import { actualizarLibro, crearLibro, eliminarLibro, obtenerLibroPOrId, obtenerLibroPorTitulo, obtenerLibrosPorAutor, obtenerTodosLibros } from "./libros.service.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";
import { AppError } from "../../utils/erroresPersonalizados.js";


//esta no fue idea mia sino de Claudio, pero ayuda: en lugar de repetir 
//las mismas validaciones para saber si si es un texto limpio o un numero entero y no letras u otra cosa
//mejor hacer dos funciones que lo validen y poder reutilizarlas las veces que sean necesarias

const validarTexto = (valor: unknown): string | undefined => {
    if (typeof valor !== "string" || valor.trim() === "") {
        return undefined
    }
    return valor.trim()
}

const validarNumero = (valor: unknown): number | undefined => {
    if (typeof valor !== "string" || valor.trim() === "") {
        return undefined
    }
    const numero = Number(valor)
    return Number.isInteger(numero) ? numero : undefined
}

export const LibrosController = {

    async obtenerTodosLibros(req: Request, res: Response) {

        try {
            const pagina = validarNumero(req.query.pagina) ?? 1 //si la validacion si retorna undefined, entonces la pagina sera la primera
            const limite = validarNumero(req.query.limite) ?? 10 //lo mismo de arriba, pero en ese caso, el limite sera de 10
            const orden = req.query.orden === "desc" ? "desc" : "asc"
            const ordenarPor = req.query.ordenarPor === "anio" ? "anio" : req.query.ordenarPor === "titulo" ? "titulo" : "categoria_id"

            const totalLibros = await obtenerTodosLibros({
                titulo: validarTexto(req.query.titulo),
                anio: validarNumero(req.query.anio),
              //  autor: validarNumero(req.query.autor_id),
                categoria_id: validarNumero(req.query.categoria_id),
                ordenarPor,
                orden,
                pagina,
                limite,
            })
            return res.status(200).json(successResponse(totalLibros, "Se obtuvieron todos los libros"))
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json(errorResponse(error))
            }
            return res.status(500).json(errorResponse(new Error("Error interno del servidor")))
        }
    },

    async obtenerLibroPorTitulo(req: Request, res: Response) {
        const { titulo } = req.body
        try {
            const libroEncontrado = await obtenerLibroPorTitulo(titulo)
            return res.status(200).json(successResponse(libroEncontrado, "Todo Nice!"));
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json(errorResponse(error)) //ese 
            }
            return res.status(500).json(errorResponse(error, null));
        }
    },

    async obtenerLibroPOrId(req: Request, res: Response) {
        try {
            const lirboEncontrado = await obtenerLibroPOrId(Number(req.params))
            return res.status(200).json(successResponse(lirboEncontrado, "Libro encontrado"));
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json(errorResponse(error)) //ese 
            }
            return res.status(500).json(errorResponse(error, null));
        }
    },

    async obtenerLibrosPorAutor(req: Request, res: Response) {
        const { autor } = req.body
        try {
            const totalLibros = await obtenerLibrosPorAutor(autor)
            return res.status(200).json(successResponse(totalLibros, "Se encontraron coincidencias."));
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json(errorResponse(error)) //ese 
            }
            return res.status(500).json(errorResponse(error, null));
        }
    },

    async crearLibro(req: Request, res: Response) {
        const { titulo, anio, descripcion = null, autor_id, categoria_id } = req.body
        try {
            const nuevoLibro = await crearLibro(titulo, anio, descripcion, autor_id, categoria_id)
            return res.status(200).json(successResponse(nuevoLibro, "Se creo un nuevo libro exitosamente"));

        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json(errorResponse(error)) //ese 
            }
            return res.status(500).json(errorResponse(error, null));
        }
    },

    async actualizarLibro(req: Request, res: Response) {
        const { titulo, anio, descripcion = null, autor_id, categoria_id } = req.body

        try {
            const nuevoLibro = await actualizarLibro(Number(req.params), titulo, anio, descripcion, autor_id, categoria_id)
            return res.status(200).json(successResponse(nuevoLibro, "Se creo un nuevo libro exitosamente"));

        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json(errorResponse(error)) //ese 
            }
            return res.status(500).json(errorResponse(error, null));
        }
    },

    async eliminarLibro(req: Request, res: Response) {
        try {
            const libroPorEliminar = await eliminarLibro(Number(req.params))
            return res.status(200).json(successResponse(libroPorEliminar, "Se eliminó el libro exitosamente."));
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json(errorResponse(error)) //ese 
            }
            return res.status(500).json(errorResponse(error, null));
        }
    }




}