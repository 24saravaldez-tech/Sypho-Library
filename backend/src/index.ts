import express from "express";
import { LibrosRouter } from "./modules/libros/libros.routes.js";

const app = express()

//app.use(process.env.PORT || "http://localhost:5173")
app.use(express.json({ limit: "1mb" }))

app.use('/api/sypho-library/books', LibrosRouter)
export { app }