import { validateEnv } from "@constatic/base";
import { z } from "zod";

export const env = await validateEnv(z.looseObject({
    BOT_TOKEN: z.string("Discord Bot Token is required").min(1),
    WEBHOOK_LOGS_URL: z.url().optional(),
    GUILD_ID: z.string().optional(),
    DATABASE_URL: z.url("Database URL is required").min(1),
    SERVER_PORT: z.coerce.number().min(1).optional(),
    FASTIFY_API_URL: z.string().min(1),
    INTERNAL_API_SECRET: z.string().min(1),
    FRONTEND_URL: z.string().min(1),
    ENV: z.enum(["dev", "prod"]).default("dev"),
}));