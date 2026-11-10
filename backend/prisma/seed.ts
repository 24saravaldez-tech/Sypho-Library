// Siembra de datos de ejemplo para Sypho-Library.
// Ejecutar con:  npx tsx prisma/seed.ts
//
// Se puede correr varias veces sin duplicar nada: busca antes de crear (es "idempotente").
// Los tipos de lectura (FISICO, DIGITAL, AUDIOLIBRO) son un catalogo: se crean con upsert
// (si existe el codigo lo actualiza, si no, lo crea).
import { prisma } from "../src/lib/prisma.js"

// Todos los campos van escritos (con null cuando no aplican) para que TypeScript, con
// exactOptionalPropertyTypes activado, nunca vea un "undefined" suelto.
type LibroSemilla = {
    titulo: string
    anio: number
    descripcion: string | null
    autor: string
    categoria: string
    tipo: "FISICO" | "DIGITAL" | "AUDIOLIBRO"
    estado: "PENDIENTE" | "EN_CURSO" | "TERMINADO" | "ABANDONADO"
    inicio: string | null // "AAAA-MM-DD"
    fin: string | null
    calificacion: number | null // 0 a 5
    pagina: number | null // para FISICO y DIGITAL
    segundo: number | null // para AUDIOLIBRO (segundos escuchados)
    resena: string | null
}

const tipos = [
    { codigo: "FISICO", nombre: "Físico" },
    { codigo: "DIGITAL", nombre: "Digital" },
    { codigo: "AUDIOLIBRO", nombre: "Audiolibro" },
]

const autores = [
    { nombre: "Gabriel García Márquez", detalles: "Escritor colombiano, Premio Nobel de Literatura 1982" },
    { nombre: "Isabel Allende", detalles: "Escritora chilena" },
    { nombre: "Miguel Ángel Asturias", detalles: "Escritor guatemalteco, Premio Nobel de Literatura 1967" },
    { nombre: "Julio Cortázar", detalles: "Escritor argentino" },
]

const categorias = ["Novela", "Cuento"]

const libros: LibroSemilla[] = [
    {
        titulo: "Cien años de soledad", anio: 1967, descripcion: "La historia de la familia Buendía en Macondo.",
        autor: "Gabriel García Márquez", categoria: "Novela", tipo: "FISICO", estado: "TERMINADO",
        inicio: "2026-01-05", fin: "2026-02-10", calificacion: 5, pagina: 471, segundo: null,
        resena: "Una obra maestra. Los nombres repetidos confunden al inicio, pero vale la pena.",
    },
    {
        titulo: "El amor en los tiempos del cólera", anio: 1985, descripcion: null,
        autor: "Gabriel García Márquez", categoria: "Novela", tipo: "DIGITAL", estado: "EN_CURSO",
        inicio: "2026-10-20", fin: null, calificacion: null, pagina: 210, segundo: null, resena: null,
    },
    {
        titulo: "Crónica de una muerte anunciada", anio: 1981, descripcion: "Un crimen que todo el pueblo conocía de antemano.",
        autor: "Gabriel García Márquez", categoria: "Novela", tipo: "AUDIOLIBRO", estado: "TERMINADO",
        inicio: "2026-08-01", fin: "2026-08-09", calificacion: 4, pagina: null, segundo: 11400,
        resena: "Se disfruta mucho en audio.",
    },
    {
        titulo: "La casa de los espíritus", anio: 1982, descripcion: null,
        autor: "Isabel Allende", categoria: "Novela", tipo: "AUDIOLIBRO", estado: "EN_CURSO",
        inicio: "2026-11-01", fin: null, calificacion: null, pagina: null, segundo: 5400, resena: null,
    },
    {
        titulo: "Eva Luna", anio: 1987, descripcion: null,
        autor: "Isabel Allende", categoria: "Novela", tipo: "FISICO", estado: "PENDIENTE",
        inicio: null, fin: null, calificacion: null, pagina: null, segundo: null, resena: null,
    },
    {
        titulo: "El Señor Presidente", anio: 1946, descripcion: "Novela sobre la dictadura y el miedo.",
        autor: "Miguel Ángel Asturias", categoria: "Novela", tipo: "FISICO", estado: "ABANDONADO",
        inicio: "2026-03-02", fin: null, calificacion: null, pagina: 80,
        segundo: null, resena: "Lo dejé en la página 80; quizá lo retome más adelante.",
    },
    {
        titulo: "Hombres de maíz", anio: 1949, descripcion: null,
        autor: "Miguel Ángel Asturias", categoria: "Novela", tipo: "DIGITAL", estado: "PENDIENTE",
        inicio: null, fin: null, calificacion: null, pagina: null, segundo: null, resena: null,
    },
    {
        titulo: "Rayuela", anio: 1963, descripcion: "Una novela que se puede leer en más de un orden.",
        autor: "Julio Cortázar", categoria: "Novela", tipo: "FISICO", estado: "PENDIENTE",
        inicio: null, fin: null, calificacion: null, pagina: null, segundo: null, resena: null,
    },
    {
        titulo: "Bestiario", anio: 1951, descripcion: "Colección de ocho cuentos.",
        autor: "Julio Cortázar", categoria: "Cuento", tipo: "DIGITAL", estado: "TERMINADO",
        inicio: "2026-06-01", fin: "2026-06-15", calificacion: 4, pagina: 150, segundo: null,
        resena: "\"Casa tomada\" fue mi favorito.",
    },
]

const sembrar = async () => {
    // 1. Catalogo de tipos de lectura
    const idPorCodigo = new Map<string, number>()
    for (const tipo of tipos) {
        const guardado = await prisma.tipo_lectura.upsert({
            where: { codigo: tipo.codigo },
            update: { nombre: tipo.nombre },
            create: tipo,
        })
        idPorCodigo.set(guardado.codigo, guardado.id)
    }

    // 2. Autores (si ya existe uno con ese nombre, se reutiliza)
    const idAutor = new Map<string, number>()
    for (const autor of autores) {
        const existente = await prisma.autor.findFirst({ where: { nombre: autor.nombre } })
        const guardado = existente ?? (await prisma.autor.create({ data: autor }))
        idAutor.set(guardado.nombre, guardado.id)
    }

    // 3. Categorias
    const idCategoria = new Map<string, number>()
    for (const nombre of categorias) {
        const guardada = await prisma.categoria.upsert({ where: { nombre }, update: {}, create: { nombre } })
        idCategoria.set(guardada.nombre, guardada.id)
    }

    // 4. Libros con su seguimiento de lectura
    let creados = 0
    for (const libro of libros) {
        const autor_id = idAutor.get(libro.autor)
        const categoria_id = idCategoria.get(libro.categoria)
        const tipo_lectura_id = idPorCodigo.get(libro.tipo)

        if (autor_id === undefined || categoria_id === undefined || tipo_lectura_id === undefined) {
            throw new Error(`Faltan datos relacionados para el libro "${libro.titulo}".`)
        }

        const existe = await prisma.libro.findFirst({ where: { titulo: libro.titulo, autor_id } })
        if (existe) {
            continue
        }

        await prisma.libro.create({
            data: {
                titulo: libro.titulo,
                anio: libro.anio,
                descripcion: libro.descripcion,
                autor_id,
                categoria_id,
                tipo_lectura_id,
                estado: libro.estado,
                inicio_lectura: libro.inicio ? new Date(libro.inicio) : null,
                fin_lectura: libro.fin ? new Date(libro.fin) : null,
                calificacion: libro.calificacion,
                pagina_actual: libro.pagina,
                segundo_actual: libro.segundo,
                resena: libro.resena,
            },
        })
        creados++
    }

    const [totalLibros, totalAutores, totalCategorias, totalTipos] = await Promise.all([
        prisma.libro.count(),
        prisma.autor.count(),
        prisma.categoria.count(),
        prisma.tipo_lectura.count(),
    ])

    console.log(`Libros nuevos creados en esta corrida: ${creados}`)
    console.log(`Total en la base -> libros: ${totalLibros}, autores: ${totalAutores}, categorías: ${totalCategorias}, tipos de lectura: ${totalTipos}`)
}

try {
    await sembrar()
} catch (error) {
    console.error("No se pudo sembrar la base de datos:", error)
    process.exitCode = 1
} finally {
    await prisma.$disconnect()
}