import path from "node:path";
import { loadEnvFile } from "node:process";
import { defineConfig } from "prisma/config";

try {
    loadEnvFile(".env");
} catch {
    console.log("DATABASE_URL no ambiente:", process.env.DATABASE_URL ? "existe" : "AUSENTE");
}

export default defineConfig({
    schema: path.join("prisma"),
    datasource: {
        url: process.env.DATABASE_URL!
    },
    migrations: {
        seed: "tsx ./src/database/seed.ts"
    }
});