import { prisma } from "../../lib/prisma.js"

export const obtenerTodosAutores = async () => {

    const autores = await prisma.autor.findMany()

    if (!autores) {
        throw new Error("No se pudieron obtener todos los autores registrados.")
    }

    return autores
}

export const obtenerUnAutor = async (nombre : string) => {

    const autor = await prisma.autor.findMany({
        where: {nombre: nombre}
    })

    if (!autor) {
        throw new Error("No se pudo obtener al autor buscado")
    }

    return autor
}