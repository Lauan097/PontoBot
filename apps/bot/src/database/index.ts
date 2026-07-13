import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "./prisma/client.js"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

declare global {
    var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient({ adapter })

if (process.env.ENV !== "prod") global.prisma = prisma
