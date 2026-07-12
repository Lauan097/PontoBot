import { defineConfig } from "tsup";
import fs from "node:fs";
import path from "node:path";

export default defineConfig({
    entry: [
        "src/**/*.ts",
        "!**/*.{d.ts,spec.ts,test.ts}"
    ],
    outDir: "build",
    format: ["esm"],
    target: "esnext",
    clean: true,
    splitting: false,
    bundle: false,
    async onSuccess() {
        const srcDir = path.join(process.cwd(), "src/discord/images");
        const destDir = path.join(process.cwd(), "build/discord/images");
        if (fs.existsSync(srcDir)) {
            fs.cpSync(srcDir, destDir, { recursive: true });
        }
    }
});