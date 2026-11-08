import { prisma } from "./lib/prisma.js"
import { app } from "./index.js";

const port = Number(process.env.PORT ?? 5010)
let server;

try {
    await prisma.$connect()

    server = app.listen(port, () => {
        console.log(`🚀 Servidor ejecutándose en http://localhost:${port}`);
    });

    server.on("error", (error) => {
        console.error("No fue posible iniciar el servidor:", error.message);
        process.exit(1);
    });
} catch (error) {
    console.log(error);
    console.error("❌ No fue posible iniciar el servidor.");
    process.exit(1);
}

let closing = false;

const shutdown = () => {
    if (closing) return;
    closing = true;
    console.log("Cerrando el servidor...");

    const timeout = setTimeout(() => {
        console.error("Se agotó el tiempo de cierre del servidor");
        process.exit(1);
    }, 10000);
    timeout.unref();

    server.close(async (error) => {
        if (error) {
            console.error("No fue posible cerrar el servidor:", error.message);
            process.exitCode = 1;
        }

        try {
            await prisma.$disconnect()
        } catch (error) {
            console.error("No fue posible cerrar PostgreSQL:", error);
            process.exitCode = 1;
        } finally {
            clearTimeout(timeout);
        }
    });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
