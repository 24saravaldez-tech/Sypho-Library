import {type Request, type Response } from "express";
import { obtenerTodosLibros } from "./libros.service.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";

export const LibrosController = {
    async obtenerTodosLibros(req: Request, res: Response) {
        try {
            const totalLibros = await obtenerTodosLibros()
            return res.status(200).json(successResponse(totalLibros, "Se obtuvieron todos los libros"));
        } catch (error) {
            return res.status(500).json(errorResponse(error, null));
        }
    }
}