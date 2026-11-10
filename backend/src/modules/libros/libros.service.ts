import type { EstadoLectura, Prisma } from "../../../generated/prisma/client.js"
import { prisma } from "../../lib/prisma.js"
import { ErrorDuplicado, ErrorNoEncontrado, IdMalFormado } from "../../utils/erroresPersonalizados.js"
import { librosDTO, librosFormateados } from "./libros.dto.js"

//Aprovechando el curso de Platzi y que por mensa hice mas trabajo del que debia,
//aplicare una interface para usar query en lugar de hacer un get 
//por cada tipo de filtro que deseo aplicar, para que no se alargue 
// mucho lo de los controllers y el servicio.

//Ademas, esta rama, develop, se quedara para mi, 
//o mas bien, para mantener mis notas personales. 
//No quiero perderlas, asi que, al finalizar el proyecto, 
//actualizare main con los cambios de develop pero 
//limpios de todos mis comentarios y dejandolo solo con la logica :3 


export type SeguimientoLibro = {
    tipo_lectura_id?: number
    estado?: EstadoLectura
    inicio_lectura?: Date | null
    fin_lectura?: Date | null
    calificacion?: number | null
    pagina_actual?: number | null
    segundo_actual?: number | null
    resena?: string | null
    portada_url?: string | null
}

export type DatosCrearLibro = {
    titulo: string
    anio: number
    descripcion: string | null
    autor_id: number
    categoria_id: number
} & SeguimientoLibro



// FiltrosLibros es un tipo o INTERFACE que es la descripcion de como deber ser un objeto en concreto. 
// Y aqui se pueden marcar campos como opcionales
export type FiltrosLibros = {
    titulo?: string | undefined
    autor?: string | undefined
    categoria_id?: number | undefined
    tipo_lectura_id?: number | undefined
    estado?: EstadoLectura | undefined
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



// La funking fk tambien hace de guardaespaldas en postgress. Esto sirve para dar un error entendible
// antes de intentar guardar un libro con un autor o categoria que no existe. Osease, que comprueba que la relacion
//exista y no la este imaginando (como yo :sad:)
const comprobarRelaciones = async (
    autor_id: number,
    categoria_id: number,
    tipo_lectura_id: number | null
) => {

    const [autor, categoria, tipo] = await Promise.all([
        //para que hacer un await por cada peticion si se puede usar Promise.all (gracias Claudio)
        prisma.autor.findUnique({
            where: { id: autor_id }
        }),

        prisma.categoria.findUnique({
            where: { id: categoria_id }
        }),

        tipo_lectura_id === null
            ? null
            : prisma.tipo_lectura.findUnique(
                { where: { id: tipo_lectura_id } })
    ])

    if (!autor) {
        throw new ErrorNoEncontrado("No existe el autor que busca.")
    }

    if (!categoria) {
        throw new ErrorNoEncontrado("No existe la categoria que busca.")
    }

    if (tipo_lectura_id !== null && !tipo) {
        throw new ErrorNoEncontrado("No existe el tipo de lectura que busca.")
    }
}


export const obtenerTodosLibros = async (
    filtros: FiltrosLibros //todo lo que vayan a pasar cuando sea llamada en el controllador va a pasar a ser tipada por los filtros
) => {
    const {
        titulo,
        autor,
        categoria_id,
        tipo_lectura_id,
        estado,
        anio,
        anioMin,
        anioMax,
        ordenarPor,
        orden,
        pagina,
        limite } = filtros //es como el cocowash de aquel: primero pasa por la lavadora 
    //(el fliltro que decide su tipado) y yo los recibo ya todos manipulados :)

    const where: Prisma.libroWhereInput = {}
    //esta es una cosilla bien interesante: basicamente, Primsa lo genero cuando creo mi modelo. 
    //esto ayuda a que el editor autocomplete lso campos dentro del where

    if (titulo) { //hace lo mismo que sequelize con [Op.x cosa]
        where.titulo = {
            contains: titulo.trim(),
            mode: "insensitive"
            //contains es para decirle que lo que busca debe contener o incluir el campo buscar
            //el modo fue lo que me ayudo en la funcion de obtenerPorCoincidencia, 
            // y es que permite que a la busqueda le de igual si esta en mayuscula o en minuscula, 
            // es insensible a la capitalizacion de las letras
        }
    }

    // Ahora si conectamos este filtro, que ya estaba planeado aqui arriba.
    if (autor) {
        where.autor = {
            nombre: {
                contains: autor.trim(),
                mode: "insensitive"
            }
        }
    }

    if (categoria_id !== undefined) {
        where.categoria_id = categoria_id
    }

    if (tipo_lectura_id !== undefined) {
        where.tipo_lectura_id = tipo_lectura_id
    }

    if (estado !== undefined) {
        where.estado = estado
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
    //en terminos pokemon: o tienes tus ocho medallas de gimnasio o no entras a la liga Kalos.

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
            //  include: { autor: true }, 
            include: {
                autor: true, //para que incluya los datos del autor
                categoria: true, //de la categoria
                tipo_lectura: true //y ahora el tipo de lectura
            },
            orderBy: [
                { [ordenarPor]: orden }, //lo habiamos usado antes pero no sabia o recordaba como se llamaba. esto es una LLAVE CALCULADA. Javascript usa el valor des la variable como nombre de la propiedad. 
                //En este caso, como existe 'titulo', 'anio', o 'categoria_id'. Bastante util para evitar ifs que decidan el valor de la propieda
                { id: "asc" }],
            skip: (pagina - 1) * limite, //cuantos registros (libros en este caso) se va a saltar. En sequelize es el equivalente al offset
            take: limite, //take es el limit en sequelize, lo que nos dice de cuantos en cuantos traera los librosS
        }),
        prisma.libro.count({ where }), //total
        //esta tambien es una consulta, como findFirst o create, etc. Es un count en sql, osea, una funcion de agrupacion. 
    ])

    // findMany entrega un arreglo: formateamos cada libro y conservamos la paginacion.
    return { libros: librosFormateados(libros), total, pagina, limite } //va a retornar los libros encontrados, el total encontrado, la pagina donde se esta y el limite que maneja
}


export const obtenerLibroPOrId = async (id: number) => {

    const libro = await prisma.libro.findUnique({
        where: { id: id },
        omit: {
            autor_id: true,
            categoria_id: true,
        },
        include: {
            autor: {
                omit: {
                    id: true //peeeeerroooo jajaj esto lo intente sin saber si existia y si funciono jajajaj: un omit para la tabla que se esta agragando
                }
            },
            categoria: {
                omit: {
                    id: true
                }
            },
            tipo_lectura: {
                omit: {
                    codigo: true,
                    id: true
                }
            }
        }
    })

    if (!libro) {
        throw new ErrorNoEncontrado("No se encontro el libro buscado.")
    }

    return librosDTO(libro)
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
    datos: DatosCrearLibro
) => {

    const {
        titulo,
        anio,
        descripcion,
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
    } = datos


    if (tipo_lectura_id == null) {
        throw new IdMalFormado("El tipo de lectura es obligatorio para crear un libro.")
    }

    const tituloLimpio: string = titulo.trim()
    const descripcionLimpia = descripcion === null ? null : descripcion?.trim()

    const existe = await obtenerLibrosPorCoincidencia(tituloLimpio, anio, autor_id)

    if (existe) {
        throw new ErrorDuplicado("Ya existe un libro con ese titulo, autor y año de publicacion.")
    }

    await comprobarRelaciones(autor_id, categoria_id, tipo_lectura_id)

    const nuevoLibro = await prisma.libro.create({
        data: {
            titulo: tituloLimpio,
            anio,
            descripcion: descripcionLimpia,
            autor_id,
            categoria_id,
            tipo_lectura_id,
            estado: estado ?? "PENDIENTE",
            inicio_lectura: inicio_lectura ?? null,
            fin_lectura: fin_lectura ?? null,
            calificacion: calificacion ?? null,
            pagina_actual: pagina_actual ?? null,
            segundo_actual: segundo_actual ?? null,
            resena: resena ?? null,
            portada_url: portada_url ?? null
        }
    })

    return nuevoLibro
}

export const actualizarLibro = async (
    id: number,
    titulo: string,
    anio: number,
    descripcion: string | null,
    autor_id: number,
    categoria_id: number,
    seguimiento: SeguimientoLibro = {}
) => {
    const libroAEditarID = await obtenerLibroPOrId(id)

    if (libroAEditarID === null) {
        throw new ErrorNoEncontrado("No se encontro el libro que quieres editar")
    }

    const existe = await obtenerLibrosPorCoincidencia(titulo.trim(), anio, autor_id)


    if (existe && existe.id !== id) {
        throw new ErrorDuplicado("Ya existe un libro con ese titulo, autor y año de publicacion.")
    }

    const tituloLimpio: string = titulo.trim()
    const descripcionLimpia = descripcion === null ? null : descripcion?.trim()

    const tipoLecturaId =
        seguimiento.tipo_lectura_id === undefined
            ? libroAEditarID.tipo_lectura_id
            : seguimiento.tipo_lectura_id

    await comprobarRelaciones(autor_id, categoria_id, tipoLecturaId)

    const libroEditado = await prisma.libro.update({
        where: { id: id },
        data: {
            titulo: tituloLimpio,
            anio: anio,
            descripcion: descripcionLimpia,
            autor_id: autor_id,
            categoria_id: categoria_id,
            ...seguimiento
        }
    })

    return libroEditado
}


export const eliminarLibro = async (id: number) => {

    const libroEliminar = await obtenerLibroPOrId(id)

    if (libroEliminar === null) {
        throw new ErrorNoEncontrado("No se encontró el libro que desea eliminar.")
    }

    const libroEliminado = await prisma.libro.delete({
        where: { id: id }
    })

    return libroEliminado

}



