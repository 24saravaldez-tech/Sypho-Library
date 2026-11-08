import { type Request, type Response } from "express";
import { actualizarLibro, crearLibro, eliminarLibro, obtenerLibroPOrId, obtenerTodosLibros } from "./libros.service.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";
import { AppError, IdMalFormado } from "../../utils/erroresPersonalizados.js";

//esta no fue idea mia sino de Claudio, pero ayuda: en lugar de repetir 
//las mismas validaciones para saber si si es un texto limpio o un numero entero y no letras u otra cosa
//mejor hacer dos funciones que lo validen y poder reutilizarlas las veces que sean necesarias


//lo que devuelve: esta obligado a retornar un string o undefined como respuesta de esta funcion
const validarTexto = (valor: unknown): string | undefined => {
    //narrowing: comprueba lo que es antes de usarlo
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

const mensajeId: string = 'El Id debe ser un número entero positivo.'

export const LibrosController = {

    async obtenerTodosLibros(req: Request, res: Response) {

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
    },

    async obtenerLibroPOrId(req: Request, res: Response) {
        const { id } = req.params
        const idValidado = validarNumero(id)

        if (typeof idValidado === "undefined") {
            throw new IdMalFormado(mensajeId)

        } else {
            const lirboEncontrado = await obtenerLibroPOrId(idValidado)
            return res.status(200).json(successResponse(lirboEncontrado, "Libro encontrado"));
        }
    },

    async crearLibro(req: Request, res: Response) {
        const { titulo, anio, descripcion = null, autor_id, categoria_id } = req.body

        const nuevoLibro = await crearLibro(titulo, anio, descripcion, autor_id, categoria_id)
        return res.status(201).json(successResponse(nuevoLibro, "Se creo un nuevo libro exitosamente"));
    },

    async actualizarLibro(req: Request, res: Response) {
        const { id } = req.params
        const idValidado = validarNumero(id)

        if (typeof idValidado === "undefined") {
            throw new IdMalFormado(mensajeId)
        }

        const { titulo, anio, descripcion = null, autor_id, categoria_id } = req.body
        const nuevoLibro = await actualizarLibro(idValidado, titulo, anio, descripcion, autor_id, categoria_id)
        return res.status(200).json(successResponse(nuevoLibro, "Se creo un nuevo libro exitosamente"));

    },

    async eliminarLibro(req: Request, res: Response) {
        const { id } = req.params
        const idValidado = validarNumero(id)

        if (typeof idValidado === "undefined") {
            throw new IdMalFormado(mensajeId)
        }

        const libroPorEliminar = await eliminarLibro(idValidado)
        return res.status(200).json(successResponse(libroPorEliminar, "Se eliminó el libro exitosamente."));

    }

}