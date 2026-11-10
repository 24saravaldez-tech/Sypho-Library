import { prisma } from "../../lib/prisma.js"
import type { Prisma } from "../../../generated/prisma/client.js"
import { ErrorDuplicado, ErrorNoEncontrado, ErrorConflicto } from "../../utils/erroresPersonalizados.js"


export type FiltrosCategorias = {
    nombre?: string | undefined
    ordenarPor: "nombre"
    orden: "asc" | "desc"
    pagina: number
    limite: number
}


export const obtenerTodasLasCategorias = async (filtros: FiltrosCategorias) => {
    const {
        nombre,
        ordenarPor,
        orden,
        pagina,
        limite
    } = filtros


    const where: Prisma.categoriaWhereInput = {}

    if (nombre) {
        where.nombre = {
            contains: nombre.trim(), mode: "insensitive"
        }
    }

    const [categorias, total] = await prisma.$transaction([
        prisma.categoria.findMany({
            where,
            orderBy: [
                { [ordenarPor]: orden },
                { id: "asc" }
            ],
            skip: (pagina - 1) * limite,
            take: limite,
        }),
        prisma.categoria.count({ where }),
    ])

    return { data: categorias, total, pagina, limite }

}

export const obtenerCategoriaPorId = async (id: number) => {

    const categorias = await prisma.categoria.findUnique({
        where: { id: id }
    })

    if (!categorias) {
        throw new ErrorNoEncontrado("No se encontro categoria con ese id.")
    }
    return { data: categorias }
}

const obtenerCategoriaPorCoincidencia = async (
    nombre: string,
) => {

    const categoria = await prisma.categoria.findFirst({
        where: {
            nombre: { equals: nombre, mode: "insensitive" },
        }
    })

    return categoria
}


export const crearCategoria = async (
    nombre: string,
) => {
    const existe = await obtenerCategoriaPorCoincidencia(nombre)

    if (existe) {
        throw new ErrorDuplicado("Ya existe una categoria con el mismo nombre.")
    }

    const nuevaCategoria = await prisma.categoria.create({
        data: {
            nombre: nombre,
        }
    })

    return { data: nuevaCategoria }
}

export const actualizarCategoria = async (
    id: number,
    nombre: string,
) => {
    const buscarCategoria = await obtenerCategoriaPorId(id)

    if (buscarCategoria.data === null) {
        throw new ErrorNoEncontrado("No se encontro la categoria que quieres editar")
    }

    const existe = await obtenerCategoriaPorCoincidencia(nombre)

    if (existe && existe.id !== id) {
        throw new ErrorDuplicado("Ya existe una categoria con el mismo nombre.")
    }

    const categoriaActualizada = await prisma.categoria.update({
        where: { id: id },
        data: {
            nombre: nombre,
        }
    })

    return { data: categoriaActualizada }
}


export const eliminarCategoria = async (id: number) => {

    const categoriaAEliminar = await obtenerCategoriaPorId(id)

    if (categoriaAEliminar.data === null) {
        throw new ErrorNoEncontrado("No se encontró la categoria que desea eliminar.")
    }

    const libros = await prisma.libro.count({ where: { categoria_id: id } })

    if (libros > 0) {
        throw new ErrorConflicto("No se puede eliminar categoria porque tiene libros asociados.")
    }
    const categoriaEliminada = await prisma.categoria.delete({
        where: { id: id }
    })

    return { data: categoriaEliminada }
}

