import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: path.join("prisma"),
    datasource: {
        url: process.env.DATABASE_URL ?? "postgresql://system:j82XuW4D4HXERqk@marcos600:5432/pontobot-db"
    },
    migrations: {
        seed: "tsx ./src/database/seed.ts"
    }
});