import type { Client } from "discord.js"
import type { FastifyInstance } from "fastify"

// Routes
import { homeRoute } from "./public/home.js"
import { syncRoute } from "./private/auth/sync.js"
import { guildsRoute } from "./private/data/guilds.js"
import { initialPageRoute } from "./private/data/initialPage.js"

export function registerRoutes(app: FastifyInstance, client: Client<true>) {
    // Public Routes
    homeRoute(app, client)

    // Private Routes
    syncRoute(app)
    guildsRoute(app, client)
    initialPageRoute(app, client)
}