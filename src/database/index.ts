import { env } from "#env"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "./prisma/client.js"

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })

declare global {
    var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient({ adapter })

if (env.ENV !== "prod") global.prisma = prisma
