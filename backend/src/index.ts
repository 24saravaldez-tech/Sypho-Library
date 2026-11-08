import express from "express";
import { LibrosRouter } from "./modules/libros/libros.routes.js";
import { manejarErrores } from "./middlewares/manejoErrores.js";

const app = express()

//app.use(process.env.PORT || "http://localhost:5173")
app.use(express.json({ limit: "1mb" }))

app.use('/api/sypho-library/books', LibrosRouter)
app.use(manejarErrores) //midleware de errores
export { app }