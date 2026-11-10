import express from "express";
import { LibrosRouter } from "./modules/libros/libros.routes.js";
import { manejarErrores } from "./middlewares/manejoErrores.js";
import { AutoresRouter } from "./modules/autores/autores.routes.js";
import { CategoriasRouter } from "./modules/categorias/categorias.routes.js";
import { prisma } from "./lib/prisma.js";

const app = express()

//app.use(process.env.PORT || "http://localhost:5173")
app.use(express.json({ limit: "1mb" }))

app.use('/api/sypho-library/books', LibrosRouter)
app.use('/api/sypho-library/authors', AutoresRouter)
app.use('/api/sypho-library/categories', CategoriasRouter)

// Es un catalogo chiquito. Se llena en la migracion y aqui solo lo consultamos.
app.get('/api/sypho-library/reading-types', async (req, res) => {
    const tipos = await prisma.tipo_lectura.findMany({ orderBy: { id: "asc" } })
    return res.json({ success: true, message: "Tipos de lectura disponibles.", data: tipos })
})

app.use(manejarErrores) //midleware de errores
export { app }
