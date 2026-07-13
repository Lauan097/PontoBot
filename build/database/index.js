import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./prisma/client.js";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = global.prisma || new PrismaClient({ adapter });
if (process.env.ENV !== "prod") global.prisma = prisma;
export {
  prisma
};
