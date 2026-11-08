import { prisma } from "../../lib/prisma.js"
import { ErrorDuplicado } from "../../utils/erroresPersonalizados.js"


export const obtenerTodosLibros = async () => {
    const libros = await prisma.libro.findMany()
    return { data: libros }
}

export const obtenerLibrosPorTitulo = async (titulo: string) => {

    const libros = await prisma.libro.findMany({
        where: { titulo: titulo }
    })

    return { data: libros }

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

    const existe = await obtenerLibrosPorCoincidencia(titulo.trim(), anio, autor_id)

    if (existe) {
        throw new ErrorDuplicado("Ya existe un libro con ese titulo, autor y año de publicacion.")
    }

    titulo = titulo.trim()
    descripcion = descripcion === null ? null : descripcion?.trim()

    const nuevoLibro = await prisma.libro.create({
        data: {
            titulo,
            anio,
            descripcion,
            autor_id,
            categoria_id
        }
    })

    return { data: nuevoLibro }
}

export const actualizarLibro = async (id: number) => {

}