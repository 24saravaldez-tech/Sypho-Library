import { Router } from "express";
import { LibrosController } from "./libros.controller.js";

const LibrosRouter = Router()

LibrosRouter.get('/all', LibrosController.obtenerTodosLibros)
LibrosRouter.get('/:id', LibrosController.obtenerLibroPOrId)
LibrosRouter.get('/by-title', LibrosController.obtenerLibroPorTitulo)
LibrosRouter.get('/by-authors', LibrosController.obtenerLibrosPorAutor)
LibrosRouter.get('/update/:id', LibrosController.actualizarLibro)
LibrosRouter.post('/new', LibrosController.crearLibro)
LibrosRouter.delete('/delete/:id', LibrosController.eliminarLibro)

export { LibrosRouter }