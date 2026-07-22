import { SubscriptionStatus, User } from "../../database/prisma/index.js"

export type AuthenticatedUser = Pick<
    User,
    | "id"
    | "discordId"
    | "username"
    | "email"
    | "avatar"
    | "discordAccessToken"
    | "discordRefreshToken"
    | "discordTokenExpiresAt"
> & {
    subscriptions: { status: SubscriptionStatus; currentPeriodEnd: Date }[]
}

import "@fastify/jwt"

declare module "@fastify/jwt" {
    interface FastifyJWT {
        user: AuthenticatedUser
    }
}
