import { createEvent } from "#base";
import { env } from "#env";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import ck from "chalk";
import fastify from "fastify";
import { registerRoutes } from "./routes/index.js";

const app = fastify();

const url = env.ENV === "dev" ? "http://localhost:3000" : "https://dashboard.pontobot.xyz"

app.register(cors, { 
    origin: [url],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true 
});

app.register(cookie, {
    secret: env.INTERNAL_API_SECRET
});

createEvent({
    name: "Start Fastify Server",
    event: "clientReady", once: true,
    async run(client) {
        registerRoutes(app, client);

        const port = env.SERVER_PORT ?? 3000;

        await app.listen({ port, host: "0.0.0.0" })
        .then(() => {
            console.log(ck.green(
                `● ${ck.underline("Fastify")} server listening on port ${port}`
            ))
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
    }
});