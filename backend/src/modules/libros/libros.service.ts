import { prisma } from "../../lib/prisma.js"

export const obtenerTodosLibros = async () => {

    const libros = await prisma.libro.findMany()

    if (libros.length === 0) {
        throw new Error("No se pudieron obtener todos los libros")
    }

    return libros
}

export const obtenerLibrosPorTitulo = async (titulo: string) => {

    const libros = await prisma.libro.findMany({
        where: { titulo: titulo }
    })

    if (libros.length === 0) {
        throw new Error("No se encontró ninguna coincidencia.")
    }

    return libros
}

export const obtenerLibrosPorAutor = async (autor: string) => {

    const libros = await prisma.libro.findMany({
        where: { autor: { nombre: autor } }, // primsa lo comprende y filtra automaticamente los resultados por nombre de autor segun la relacion que tiene con libros
        include: { autor: true },
    })

    if (!libros) {
        throw new Error("No se encontró ninguna coincidencia.")
    }

    return libros
}


// export const crearLibro = async (
//     titulo: string,
//     anio: number,
//     descripcion: string,
//     autor_id: number,
//     categoria_id: number
// ) => {

//     const nuevoLibro = await prisma.libro.create({
//         data: {
//             titulo, anio, descripcion, autor_id, categoria_id
//         }
//     })

//     if (!nuevoLibro) {
//         throw new Error("No se pudo crear este nuevo libro.")
//     }

//     return nuevoLibro
// }