import { type Request, type Response } from "express";
import { successResponse } from "../../utils/response.utils.js";
import { IdMalFormado } from "../../utils/erroresPersonalizados.js";
import { validarNumero, validarTexto } from "../../utils/validadoresUnknown.js";
import { actualizarCategoria, crearCategoria, eliminarCategoria, obtenerCategoriaPorId, obtenerTodasLasCategorias } from "./categorias.service.js";

const mensajeId: string = 'El Id debe ser un número entero positivo.'

export const CategoriasController = {

    async obtenerTodasLasCategorias(req: Request, res: Response) {

        const pagina = validarNumero(req.query.pagina) ?? 1
        const limite = validarNumero(req.query.limite) ?? 10
        const nombreLimipio = validarTexto(req.query.nombre)
        const orden = req.query.orden === "desc" ? "desc" : "asc"
        const ordenarPor = req.query.ordenarPor === "nombre" ? "nombre" : "nombre"

        const totalAutores = await obtenerTodasLasCategorias({
            nombre: nombreLimipio !== undefined ? nombreLimipio : undefined,
            ordenarPor,
            orden,
            pagina,
            limite,
        })
        return res.status(200).json(successResponse(totalAutores, "Se obtuvieron todas las categorias."))
    },

    async obtenerCategoriaPorId(req: Request, res: Response) {
        const id = validarNumero(req.params.id)

        if (typeof id === "undefined") {
            throw new IdMalFormado(mensajeId)

        } else {
            const autorEncontrado = await obtenerCategoriaPorId(id)
            return res.status(200).json(successResponse(autorEncontrado, "Categoria encontrada"));
        }
    },

    async crearCategoria(req: Request, res: Response) {
        const { nombre } = req.body
        const nombreLimipio = validarTexto(nombre)

        if (typeof nombreLimipio === "string") {
            const nuevoAutor = await crearCategoria(nombreLimipio)
            return res.status(201).json(successResponse(nuevoAutor, "Se creo una nueva categoria exitosamente"));
        }

        throw new IdMalFormado("El nombre de la categoria debe ser un texto no vacio.")

    },

    async actualizarCategoria(req: Request, res: Response) {
        const { id } = req.params
        const idValidado = validarNumero(id)

        if (typeof idValidado === "undefined") {
            throw new IdMalFormado(mensajeId)
        }
        const { nombre } = req.body

        const nuevoLibro = await actualizarCategoria(idValidado, nombre)
        return res.status(200).json(successResponse(nuevoLibro, "Se actualizo la categoria exitosamente"));

    },

    async eliminarCategoria(req: Request, res: Response) {
        const { id } = req.params
        const idValidado = validarNumero(id)

        if (typeof idValidado === "undefined") {
            throw new IdMalFormado(mensajeId)
        }

        const autorEliminado = await eliminarCategoria(idValidado)
        return res.status(200).json(successResponse(autorEliminado, "Se eliminó la categoria exitosamente."));

    }

}