import { Router } from "express";
import { LibrosController } from "./libros.controller.js";

const LibrosRouter = Router()

LibrosRouter.get('/all', LibrosController.obtenerTodosLibros)
LibrosRouter.get('/:id', LibrosController.obtenerLibroPOrId)
LibrosRouter.post('/new', LibrosController.crearLibro)
LibrosRouter.put('/update/:id', LibrosController.actualizarLibro)
LibrosRouter.delete('/delete/:id', LibrosController.eliminarLibro)

export { LibrosRouter }