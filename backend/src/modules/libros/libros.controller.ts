import { type Request, type Response } from "express";
import { actualizarLibro, crearLibro, eliminarLibro, obtenerLibroPOrId, obtenerLibroPorTitulo, obtenerLibrosPorAutor, obtenerTodosLibros } from "./libros.service.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";
import { AppError } from "../../utils/erroresPersonalizados.js";

export const LibrosController = {
    async obtenerTodosLibros(req: Request, res: Response) {
        try {
            const totalLibros = await obtenerTodosLibros()
            return res.status(200).json(successResponse(totalLibros, "Se obtuvieron todos los libros"));
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json(errorResponse(error)) //ese 
            }
            return res.status(500).json(errorResponse(error, null));
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
        const {titulo, anio, descripcion = null, autor_id, categoria_id} = req.body
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

        async actualizarLibro (req: Request, res: Response) {
        const {titulo, anio, descripcion = null, autor_id, categoria_id} = req.body

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