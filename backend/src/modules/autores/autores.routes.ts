import { Router } from "express";
import { AutoresController } from "./autores.controller.js";

const AutoresRouter = Router()

AutoresRouter.get('/all', AutoresController.obtenerTodosAutores)
AutoresRouter.get('/:id', AutoresController.obtenerAutorPorId)
AutoresRouter.post('/new', AutoresController.crearAutor)
AutoresRouter.put('/update/:id', AutoresController.actualizarAutor)
AutoresRouter.delete('/delete/:id', AutoresController.eliminarAutor)

export { AutoresRouter }