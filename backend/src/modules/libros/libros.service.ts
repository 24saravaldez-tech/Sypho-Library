import { prisma } from "../../lib/prisma.js"
import { ErrorDuplicado, ErrorNoEncontrado } from "../../utils/erroresPersonalizados.js"


export const obtenerTodosLibros = async () => {
    const libros = await prisma.libro.findMany()
    return { data: libros }
}

export const obtenerLibroPorTitulo = async (titulo: string) => {

    const libros = await prisma.libro.findFirst({
        where: { titulo: titulo }
    })

    return { data: libros }
}

export const obtenerLibroPOrId = async (id: number) => {

    const libro = await prisma.libro.findUnique({
        where: { id: id }
    })

    return { data: libro }
}

export const obtenerLibrosPorAutor = async (autor: string) => {

    const libros = await prisma.libro.findMany({
        where: { autor: { nombre: autor } }, // primsa lo comprende y filtra automaticamente los resultados por nombre de autor segun la relacion que tiene con libros
        include: { autor: true },
    })

    return { data: libros }
}

const obtenerLibrosPorCoincidencia = async (
    titulo: string,
    anio: number,
    autor_id: number,
) => {

    const libros = await prisma.libro.findFirst({
        where: {
            titulo: { equals: titulo.trim(), mode: "insensitive" },
            anio: anio,
            autor_id: autor_id
        }
    })

    return libros

}


export const crearLibro = async (
    titulo: string,
    anio: number,
    descripcion: string | null,
    autor_id: number,
    categoria_id: number
) => {

    const tituloLimpio: string = titulo.trim()
    const descripcionLimpia = descripcion === null ? null : descripcion?.trim()

    const existe = await obtenerLibrosPorCoincidencia(tituloLimpio, anio, autor_id)

    if (existe) {
        throw new ErrorDuplicado("Ya existe un libro con ese titulo, autor y año de publicacion.")
    }

    const nuevoLibro = await prisma.libro.create({
        data: {
            titulo: tituloLimpio,
            anio,
            descripcion: descripcionLimpia,
            autor_id,
            categoria_id
        }
    })

    return { data: nuevoLibro }
}

export const actualizarLibro = async (
    id: number,
    titulo: string,
    anio: number,
    descripcion: string | null,
    autor_id: number,
    categoria_id: number
) => {
    const libroAEditarID = await obtenerLibroPOrId(id)

    if (libroAEditarID.data === null) {
        throw new ErrorNoEncontrado("No se encontro el libro que quieres editar")
    }

    const existe = await obtenerLibrosPorCoincidencia(titulo.trim(), anio, autor_id)

    if (existe?.id !== id) {
        throw new ErrorDuplicado("Ya existe un libro con ese titulo, autor y año de publicacion.")
    }

    const tituloLimpio: string = titulo.trim()
    const descripcionLimpia = descripcion === null ? null : descripcion?.trim()

    const libroEditado = await prisma.libro.update({
        where: { id: id },
        data: {
            titulo: tituloLimpio,
            anio: anio,
            descripcion: descripcionLimpia,
            autor_id: autor_id,
            categoria_id: categoria_id
        }
    })

    return { data: libroEditado }
}


export const eliminarLibro = async (id: number) => {

    const libroEliminar = await obtenerLibroPOrId(id)

    if (libroEliminar.data === null) {
        throw new ErrorNoEncontrado("No se encontró el libro que desea eliminar.")
    }

    const libroEliminado = await prisma.libro.delete({
        where: { id: id }
    })

    return { data: libroEliminado }

}

