import { prisma } from "../../lib/prisma.js"
import type { Prisma } from "../../../generated/prisma/client.js"
import { ErrorDuplicado, ErrorNoEncontrado, ErrorConflicto } from "../../utils/erroresPersonalizados.js"

export type FiltrosAutores = {
    nombre?: string | undefined
    ordenarPor: "nombre"
    orden: "asc" | "desc"
    pagina: number
    limite: number
}


export const obtenerTodosAutores = async (filtros: FiltrosAutores) => {
    const {
        nombre,
        ordenarPor,
        orden,
        pagina,
        limite
    } = filtros


    const where: Prisma.autorWhereInput = {}

    if (nombre) {
        where.nombre = {
            contains: nombre.trim(), mode: "insensitive"
        }
    }

    const [autores, total] = await prisma.$transaction([
        prisma.autor.findMany({
            where,
            orderBy: [
                { [ordenarPor]: orden },
                { id: "asc" }
            ],
            skip: (pagina - 1) * limite,
            take: limite,
            include: { libro: true }
        }),
        prisma.autor.count({ where }),
    ])

    return { data: autores, total, pagina, limite }

}

export const obtenerAutorPorId = async (id: number) => {

    const autores = await prisma.autor.findUnique({
        where: { id: id }
    })

    if (!autores) {
        throw new ErrorNoEncontrado("No se encontro autor con ese id.")
    }

    return { data: autores }
}

const obtenerAutorPorCoincidencia = async (
    nombre: string,
    detalles: string | null,
) => {

    const autor = await prisma.autor.findFirst({
        where: {
            nombre: { equals: nombre, mode: "insensitive" },
            detalles: { equals: detalles, mode: "insensitive" }
        }
    })

    return autor
}


export const crearAutor = async (
    nombre: string,
    detalles: string | null,
) => {
    const existe = await obtenerAutorPorCoincidencia(nombre, detalles)

    if (existe) {
        throw new ErrorDuplicado("Ya existe un autor con el mismo nombre y la misma descripcion.")
    }

    const nuevoAutor = await prisma.autor.create({
        data: {
            nombre: nombre,
            detalles: detalles
        }
    })

    return { data: nuevoAutor }
}

export const actualizarAutor = async (
    id: number,
    nombre: string,
    detalles: string | null,
) => {
    const buscarAutor = await obtenerAutorPorId(id)

    if (buscarAutor.data === null) {
        throw new ErrorNoEncontrado("No se encontro el autor que quieres editar")
    }

    const existe = await obtenerAutorPorCoincidencia(nombre, detalles)

    if (existe && existe.id !== id) {
        throw new ErrorDuplicado("Ya existe un autor con el mismo nombre y la misma descripcion.")
    }

    const autorEditado = await prisma.autor.update({
        where: { id: id },
        data: {
            nombre: nombre,
            detalles: detalles
        }
    })

    return { data: autorEditado }
}


export const eliminarAutor = async (id: number) => {

    const autorAEliminar = await obtenerAutorPorId(id)

    if (autorAEliminar.data === null) {
        throw new ErrorNoEncontrado("No se encontró el autor que desea eliminar.")
    }

    //solo verifico que no tenga libros registrados a su nombre
    // porque si lo borro asi, me llevo los libros entre las patas.

    const libros = await prisma.libro.count({ where: { autor_id: id } })

    if (libros > 0) {
        throw new ErrorConflicto("No se puede eliminar autor poque tiene libros asociados.")
    }

    const autorEliminado = await prisma.autor.delete({
        where: { id: id }
    })

    return { data: autorEliminado }
}

