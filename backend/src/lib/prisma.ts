//aqui se creara por unica vez el cliente de Prisma.En un servidor, no se debe ni se puede crear un cliente por cada pericion
import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";

const url = process.env["DATABASE_URL"];
if (!url) {
    throw new Error("Falta DATABASE_URL en el .env");
}

const adapter = new PrismaPg({ connectionString: url });
export const prisma = new PrismaClient({ adapter });


