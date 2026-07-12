import path from "node:path";
import { loadEnvFile } from "node:process";
import { defineConfig } from "prisma/config";

loadEnvFile(
    process.argv.includes("--dev") 
        ? ".env.dev" // Usage: npx prisma@latest ... -- --dev
        : ".env"
);

export default defineConfig({
    schema: path.join("prisma"),
    datasource: {
        url: process.env.DATABASE_URL! 
    },
    migrations: {
        seed: "tsx ./src/database/seed.ts"
    }
});