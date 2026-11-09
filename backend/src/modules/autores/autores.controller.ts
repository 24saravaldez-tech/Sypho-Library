import { type Request, type Response } from "express";
import { successResponse } from "../../utils/response.utils.js";
import { IdMalFormado } from "../../utils/erroresPersonalizados.js";
import { validarNumero, validarTexto } from "../../utils/validadoresUnknown.js";
import { actualizarAutor, crearAutor, eliminarAutor, obtenerAutorPorId, obtenerTodosAutores } from "./autores.service.js";

const mensajeId: string = 'El Id debe ser un número entero positivo.'

export const AutoresController = {

    async obtenerTodosAutores(req: Request, res: Response) {

        const pagina = validarNumero(req.query.pagina) ?? 1
        const limite = validarNumero(req.query.limite) ?? 10
        const nombreLimipio = validarTexto(req.query.titulo)
        const orden = req.query.orden === "desc" ? "desc" : "asc"
        const ordenarPor = req.query.ordenarPor === "nombre" ? "nombre" : "nombre"

        const totalAutores = await obtenerTodosAutores({
            nombre: nombreLimipio !== undefined ? nombreLimipio : undefined,
            ordenarPor,
            orden,
            pagina,
            limite,
        })
        return res.status(200).json(successResponse(totalAutores, "Se obtuvieron todos los autores"))
    },

    async obtenerAutorPorId(req: Request, res: Response) {
        const id = validarNumero(req.params.id)

        if (typeof id === "undefined") {
            throw new IdMalFormado(mensajeId)

        } else {
            const autorEncontrado = await obtenerAutorPorId(id)
            return res.status(200).json(successResponse(autorEncontrado, "Autor encontrado"));
        }
    },

    async crearAutor(req: Request, res: Response) {
        const { nombre, descripcion } = req.body
        const nombreLimipio = validarTexto(nombre)

        if (typeof nombreLimipio === "string") {
            const nuevoAutor = await crearAutor(nombreLimipio, descripcion)
            return res.status(201).json(successResponse(nuevoAutor, "Se creo un nuevo autor exitosamente"));
        }


    },

    async actualizarAutor(req: Request, res: Response) {
        const { id } = req.params
        const idValidado = validarNumero(id)

        if (typeof idValidado === "undefined") {
            throw new IdMalFormado(mensajeId)
        }
        const { nombre, descripcion } = req.body

        const nuevoLibro = await actualizarAutor(idValidado, nombre, descripcion)
        return res.status(200).json(successResponse(nuevoLibro, "Se creo un nuevo libro exitosamente"));

    },

    async eliminarAutor(req: Request, res: Response) {
        const { id } = req.params
        const idValidado = validarNumero(id)

        if (typeof idValidado === "undefined") {
            throw new IdMalFormado(mensajeId)
        }

        const autorEliminado = await eliminarAutor(idValidado)
        return res.status(200).json(successResponse(autorEliminado, "Se eliminó el autor exitosamente."));

    }

}