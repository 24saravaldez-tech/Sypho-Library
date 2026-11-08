import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg"; //este es el adaptador o el puente a postgres y el cliente que Prisma genero
import { PrismaClient } from "../generated/prisma/client.js"; //el cliente

const url = process.env["DATABASE_URL"];
if (!url) {
    throw new Error("Falta DATABASE_URL en el .env")
} //primero, como buena practica, se debe asegurar de que si exista una url en el .env

const adapter = new PrismaPg({ connectionString: url }) //Despues, se crea el puente con la url
const prisma = new PrismaClient({ adapter }); //y se crea al cliente con ese mismo puente

//========================================================================================
// const libros = await prisma.libro.findMany()//primera consulta normal
// console.log('Yo soy todos los libros sin filtro: ', libros)


// //========================================================================================
// const variosLibrosConFiltros = await prisma.libro.findMany({  //segunda consulta de varios libros con filtros
//     where: { autor_id: 1 },
//     include: { autor: { where: { nombre: "Hannah Nicole Maehrer" } } }, //este include solo sirve para relaciones
// })
// console.log('Yo soy algunos libros con filtros', variosLibrosConFiltros)


const variosLibrosConFiltros = await prisma.libro.findMany({
    where: {
        autor: {
            nombre: "Hannah Nicole Maehrer",
        },
    },
    include: { autor: true },
});

console.log('Yo soy algunos libros con filtros', variosLibrosConFiltros)



// //========================================================================================
// const unLibro = await prisma.libro.findUnique({ where: { id: 10 } })
// console.log('yo soy un solo libro encontrado por un id', unLibro)


//========================================================================================
// const crearAutor = await prisma.autor.create({
//     data: {
//         nombre: "Gabrielle Zevin",
//         detalles: "Gabrielle Zevin es una autora superventas internacional cuyos libros se han traducido a más de treinta idiomas. 'Las mil y una historias de A. J. Fikry' estuvo varios meses en la lista de más vendidos de 'The New York Times'"
//     }
// })

// console.log('se ha creado una nueva autora: ', crearAutor)

//========================================================================================
// const crearUnLibro = await prisma.libro.create({ //aqui me acabo de dar cuenta de que para crear un libro primero debo registrar un autor xd
//     data: {
//         titulo: "Mañana, mañana y mañana",
//         anio: 2022,
//         descripcion: "Sam Masur y Sadie Green, dos amigos de la infancia que se reencuentran en sus años universitarios en Cambridge, Massachusetts, junto a Marx Watanabe (amigo y compañero de piso de Sam)",
//         autor_id: 5,
//         categoria_id: 3
//     }
// })

// const verAutores  = await prisma.autor.findMany()
// console.log('autores luego de la creacion de uno nuevo: ', verAutores)

//========================================================================================
// const eliminarUnLibro = await prisma.autor.delete({ where: { id: 7 } })
// console.log('yo soy un autor eliminado por un id', eliminarUnLibro)



//========================================================================================
await prisma.$disconnect() //se cierra la conexion para que el programa termine

