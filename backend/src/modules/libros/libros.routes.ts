import { Router } from "express";
import { LibrosController } from "./libros.controller.js";

const LibrosRouter = Router()

LibrosRouter.get('/all', LibrosController.obtenerTodosLibros)

export { LibrosRouter }