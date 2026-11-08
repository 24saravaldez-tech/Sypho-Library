import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";

const url = process.env["DATABASE_URL"];
if (!url) {
    throw new Error("Falta DATABASE_URL en el .env");
}

const adapter = new PrismaPg({ connectionString: url });
export const prisma = new PrismaClient({ adapter });


