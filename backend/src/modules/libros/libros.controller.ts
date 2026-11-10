import { type Request, type Response } from "express";
import { actualizarLibro, crearLibro, eliminarLibro, obtenerLibroPOrId, obtenerTodosLibros } from "./libros.service.js";
import { errorResponse, successResponse } from "../../utils/response.utils.js";
import { AppError, IdMalFormado } from "../../utils/erroresPersonalizados.js";

//tengo plan de ataque: 
//1. Modificar la tabla de libros y crear una nueva que se llame Tipo_Lectura
//2. La modificacion de libros sera para que tenga fecha de creacion, edicion. Fecha de inicio de lectura y de finalizacion de lectura
//  tambien un apartado para su propia calificacion 0/5 estrellas, un "separador" donde si quiere puede anotar en que pagina se quedo.
//  los detalles del libro, al consultarlo, deben traer todo esto.
//3. Un libro si se puede eliminar pero un autor con libros no, lo mismo para una categoria que contenga libros.
//4. La tabla de Tipo_Lectura sera para marcar si fue lectura normar (Fisico o digital) o audiolibro. Y lo del separador podria
//   ser un numero de pagina o minuto en el que se quedo de escucha.
// 5. Y me falta investigar como calajos se pueden guardar imagenes en una base de datos


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
            anioMin: validarNumero(req.query.anioMin),
            anioMax: validarNumero(req.query.anioMax),
            autor: validarTexto(req.query.autor),
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
        const {
            titulo,
            anio,
            descripcion = null,
            autor_id,
            categoria_id,
            tipo_lectura_id,
            estado,
            inicio_lectura,
            fin_lectura,
            calificacion,
            pagina_actual,
            segundo_actual,
            resena,
            portada_url
        } = req.body

        const nuevoLibro = await crearLibro({
            titulo,
            anio,
            descripcion,
            autor_id,
            categoria_id,
            tipo_lectura_id,
            estado,
            calificacion,
            pagina_actual,
            segundo_actual,
            resena,
            portada_url,
            inicio_lectura: inicio_lectura == null ? inicio_lectura : new Date(inicio_lectura),
            fin_lectura: fin_lectura == null ? fin_lectura : new Date(fin_lectura),
        })
        return res.status(201).json(successResponse(nuevoLibro, "Se creo un nuevo libro exitosamente"));
    },

    async actualizarLibro(req: Request, res: Response) {
        const { id } = req.params
        const idValidado = validarNumero(id)

        if (typeof idValidado === "undefined") {
            throw new IdMalFormado(mensajeId)
        }

        const { titulo, anio, descripcion = null, autor_id, categoria_id } = req.body

        //me da mucha dinorabia tener que estar repite y repite (otra vez la burra al trigo)
        //todos estos datos. Voy a investigar la manera -ma;ana- de no tener que hacerlo.
        //tener una clase o asi, para reutilizarla

        const { tipo_lectura_id,
            estado,
            inicio_lectura,
            fin_lectura,
            calificacion,
            pagina_actual,
            segundo_actual,
            resena,
            portada_url
        } = req.body

        const nuevoLibro = await actualizarLibro(
            idValidado,
            titulo,
            anio,
            descripcion,
            autor_id,
            categoria_id,
            {
                tipo_lectura_id,
                estado,
                calificacion,
                pagina_actual,
                segundo_actual,
                resena,
                portada_url,
                inicio_lectura: inicio_lectura == null ? inicio_lectura : new Date(inicio_lectura),
                fin_lectura: fin_lectura == null ? fin_lectura : new Date(fin_lectura),
            }
        )
        return res.status(200).json(successResponse(nuevoLibro, "Se actualizo el libro exitosamente"));

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
