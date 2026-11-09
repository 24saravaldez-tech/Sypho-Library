import type { Prisma } from "../../../generated/prisma/client.js"
import { prisma } from "../../lib/prisma.js"
import { ErrorDuplicado, ErrorNoEncontrado } from "../../utils/erroresPersonalizados.js"

//Aprovechando el curso de Platzi y que por mensa hice mas trabajo del que debia,
//aplicare una interface para usar query en lugar de hacer un get 
//por cada tipo de filtro que deseo aplicar, para que no se alargue 
// mucho lo de los controllers y el servicio.

//Ademas, esta rama, develop, se quedara para mi, 
//o mas bien, para mantener mis notas personales. 
//No quiero perderlas, asi que, al finalizar el proyecto, 
//actualizare main con los cambios de develop pero 
//limpios de todos mis comentarios y dejandolo solo con la logica :3 


// FiltrosLibros es un tipo o INTERFACE que es la descripcion de como deber ser un objeto en concreto. 
// Y aqui se pueden marcar campos como opcionales

export type FiltrosLibros = {
    titulo?: string | undefined
    //autor?: string | undefined
    categoria_id?: number | undefined
    anio?: number | undefined
    anioMin?: number | undefined
    anioMax?: number | undefined
    ordenarPor: "titulo" | "categoria_id" | "anio" //para que no se permitan otros campos de filtros que no sean titulo o anio
    //una cosilla interesante de titulo | anio: se le llama 'union de textos exactos'
    orden: "asc" | "desc" //la misma vaina de arriba
    pagina: number
    limite: number
} //que declare desde titulo hasta anio como opcionales. Desde ordenar para
//limite se manejaran por default pero desde el controlador 
// para que typescript no me haga tanto quilombo aqui :)

export const obtenerTodosLibros = async (
    filtros: FiltrosLibros
) => {
    const {
        titulo,
       // autor,
        categoria_id,
        anio,
        anioMin,
        anioMax,
        ordenarPor,
        orden,
        pagina,
        limite } = filtros

    const where: Prisma.libroWhereInput = {}
    //esta es una cosilla bien interesante: basicamente, Primsa lo genero cuando creo mi modelo. 
    //esto ayuda a que el editor autocomplete lso campos dentro del where

    if (titulo) { //hace lo mismo que sequelize con [Op.x cosa]
        where.titulo = {
            contains: titulo.trim(), mode: "insensitive"
            //contains es para decirle que lo que busca debe contener o incluir el campo buscar
            //el modo fue lo que me ayudo en la funcion de obtenerPorCoincidencia, 
            // y es que permite que a la busqueda le de igual si esta en mayuscula o en minuscula, 
            // es insensible a la capitalizacion de las letras
        }
    }

    // if (autor) {
    //     where.autor = {
    //         nombre: { contains: autor.trim(), mode: "insensitive" }
    //     }
    // }

    if (categoria_id !== undefined) {
        where.categoria_id = categoria_id
    }

    if (anio !== undefined) {
        where.anio = anio
    }

    if (anioMin !== undefined || anioMax !== undefined) {
        where.anio = {} //aplica la misma que en sequelize: primero se crea el objeto vacio y luego....
        if (anioMin !== undefined) {
            where.anio.gte = anioMin //graeter than equal
            //...aquim si hay un anio minimo desde el que se desea buscar, se agrega al bjeto
        }
        if (anioMax !== undefined) {
            where.anio.lte = anioMax //lower than equal
            //same thing...
        }
    }

    //aqui aplica las famosas transacciones: todo o nada. Esto es atomicidad (la A de ACID)
    //Si no se cumplen libros (), no pasa a total y se detiene. O si no se cunple total (), todo se detiene.
    //en terminos pokemon: o tienes tu equipo de 6 o no entras a la liga Kalos.

    const [libros, total] = await prisma.$transaction([
        //Es un metodo de prisma para meter varias consultas en una sola transaccion. 
        //El arreglo funciona asi: le paso las consulta y prisma las ejecuta en el orden 
        //en que estan dentro del arreglo y devuelve una lista con los resultados en el mismo orden

        //ahora bien, aqui esta el chiste: libros es el resultado de prisma.libro.findMany; 
        // la transaccion de primsa guarda el resultado en esa primera variable. 
        // total es el resultado de prisma.libro.count (que no mas cuentra cuantos libros se encontraron)

        // La transaccion solo la use por mero morbo de saber como se usaba xd. 

        prisma.libro.findMany({ //libros
            where, //el objeto where que antes se lleno con todos los datos que queremos filtrar
          //  include: { autor: true }, //para que incluya los datos del autor
            orderBy: [{ [ordenarPor]: orden }], //lo habiamos usado antes pero no sabia o recordaba como se llamaba. esto es una LLAVE CALCULADA. Javascript usa el valor des la variable como nombre de la propiedad. En este caso, como existe 'titulo', 'anio', o 'categoria_id'. Bastante util para evitar ifs que decidan el valor de la propiedad
            skip: (pagina - 1) * limite, //cuantos registros (lirbos en este caso) se va a saltar. En sequelize es el equivalente al offset
            take: limite, //take es el limit en sequelize, lo que nos dice de cuantos en cuantos traera los librosS
        }),
        prisma.libro.count({ where }), //total
        //esta tambien es una consulta, como findFirst o create, etc. Es un count en sql, osea, una funcion de agrupacion. 
    ])

    return { data: libros, total, pagina, limite } //va a retornar los libros encontrados, el total encontrado, la pagina donde se esta y el limite que maneja
}


export const obtenerLibroPOrId = async (id: number) => {

    const libro = await prisma.libro.findUnique({
        where: { id: id }
    })

    return { data: libro }
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

    if (existe?.id !== id && id !== undefined) {
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

