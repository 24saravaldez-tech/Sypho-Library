import { Router } from "express";
import { CategoriasController } from "./categorias.controller.js";

const CategoriasRouter = Router()

CategoriasRouter.get('/all', CategoriasController.obtenerTodasLasCategorias)
CategoriasRouter.get('/:id', CategoriasController.obtenerCategoriaPorId)
CategoriasRouter.post('/new', CategoriasController.crearCategoria)
CategoriasRouter.put('/update/:id', CategoriasController.actualizarCategoria)
CategoriasRouter.delete('/delete/:id', CategoriasController.eliminarCategoria)

export { CategoriasRouter }