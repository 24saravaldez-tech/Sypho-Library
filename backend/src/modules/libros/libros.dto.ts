type formatoParaLibro = {
    id: number,
    titulo: string,
    descripcion?: string | null,
    tipo_lectura_id: number,
    estado: string,
    inicio_lectura: string | null,
    fin_lectura: string | null,
    calificacion: number | null,
    pagina_actual: number | null,
    segundo_actual?: number | null,
    resena?: string | null,
    portada_url?: string | null,
    creado_en: string,
    autor_nombre: string,
    autor_detalles?: string | null,
    categoria_nombre: string,
    tipo_lectura_nombre: string
}

type formatoParaAutor = {
    nombre: string,
    detalles?: string | null
}

type formatoParaCategoria = {
    nombre: string
}

type formatoParaTipoLectura = {
    nombre: string
}

// const librosDTO = (libro: object) =>{
//     formatoParaLibro.id = libro.id
// }

//aqui arribita habia pensado hacer un dto como lo hicimos en gestion academica
//pero segun la documentacion como es tipado.... primero se debe aclarar que esas propiedades si van a llegar

const librosDTO = (libro: {
    id: number,
    titulo: string,
    descripcion?: string | null,
    tipo_lectura_id: number,
    estado: string,
    // Prisma entrega Date, no string. Y si aun no hay lectura, puede venir null.
    // La entrada describe lo que viene de la base; el DTO describe lo que sale.
    inicio_lectura: Date | null,
    fin_lectura: Date | null,
    calificacion: number | null,
    pagina_actual: number | null,
    segundo_actual?: number | null,
    resena?: string | null,
    portada_url?: string | null,
    creado_en: Date,
    // autor: object,
    // categoria: object,
    // tipo_lectura: object
    autor: formatoParaAutor,
    categoria: formatoParaCategoria,
    tipo_lectura: formatoParaTipoLectura
}) => {

    const libroFormateado: formatoParaLibro = {
        id: libro.id,
        titulo: libro.titulo,
        descripcion: libro.descripcion ? libro.descripcion : null,
        tipo_lectura_id: libro.tipo_lectura_id,
        estado: libro.estado,
        inicio_lectura: libro.inicio_lectura ? libro.inicio_lectura.toISOString().slice(0, 10) : null,
        fin_lectura: libro.fin_lectura ? libro.fin_lectura.toISOString().slice(0, 10) : null,
        calificacion: libro.calificacion,
        pagina_actual: libro.pagina_actual,
        //aqui se cambio te termario a ?? (no se como se llama) porque sino se pierte el 0, que es un segundo actual valido
        segundo_actual: libro.segundo_actual ?? null,
        resena: libro.resena ? libro.resena : null,
        portada_url: libro.portada_url ?? null,
        creado_en: libro.creado_en.toISOString(),
        // autor_nombre: libro.autor.nombre,
        //aqui se me dio otro quilombo, pues necesito tipar tambien autores, como venga en objeto
        autor_nombre: libro.autor.nombre,
        autor_detalles: libro.autor.detalles ? libro.autor.detalles : null,
        categoria_nombre: libro.categoria.nombre,
        tipo_lectura_nombre: libro.tipo_lectura.nombre
    }

    return libroFormateado
}


// Explicacion de claudio del porque ahora si funciona:  Parameters obtiene los tipos de los parametros de una funcion.
// [0] toma el primero: el objeto que recibe librosDTO. No el DTO ya formateado.
type LibroEntrada = Parameters<typeof librosDTO>[0]

// El [] indica que recibimos varios libros. Asi TS ya sabe que es cada l del map.
// map devuelve un arreglo nuevo con cada libro pasado por el DTO individual.
const librosFormateados = (libros: LibroEntrada[]) => {
    return libros.map((l) => librosDTO(l))
}

// Uno para un solo libro y el otro para un arreglo de libros.
export {librosDTO, librosFormateados}
