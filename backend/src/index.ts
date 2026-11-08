import express from "express";
import { LibrosRouter } from "./modules/libros/libros.routes.js";
import { manejarErrores } from "./middlewares/manejoErrores.js";

const app = express()

app.use(express.json({ limit: "1mb" }))

app.use('/api/sypho-library/books', LibrosRouter)
app.use(manejarErrores)
export { app }