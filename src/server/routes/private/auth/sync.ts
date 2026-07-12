import { prisma } from "#database";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";

let cachedFreePlanId: string | null = null;

async function getFreePlanId(): Promise<string> {
    if (cachedFreePlanId) return cachedFreePlanId;

    const freePlan = await prisma.plan.findUniqueOrThrow({
        where: { slug: "free" },
        select: { id: true },
    });

    cachedFreePlanId = freePlan.id;
    return cachedFreePlanId;
}

export function syncRoute(app: FastifyInstance) {
    app.post("/auth/sync", async (req, res) => {
        const internalSecret = req.headers["x-internal-secret"];

        if (internalSecret !== process.env.INTERNAL_API_SECRET) {
            return res.status(StatusCodes.UNAUTHORIZED).send({ error: "Unauthorized Gateway" });
        }

        const {
            discordId,
            username,
            email,
            avatar,
            accessToken,
            refreshToken,
            expiresAt
        } = req.body as {
            discordId: string;
            username: string;
            email: string | null;
            avatar: string | null;
            accessToken: string;
            refreshToken: string;
            expiresAt: number | null;
        };

        try {
            const freePlanId = await getFreePlanId();

            const user = await prisma.user.upsert({
                where: { discordId },
                update: {
                    username,
                    email,
                    avatar,
                    discordAccessToken: accessToken,
                    discordRefreshToken: refreshToken,
                    discordTokenExpiresAt: expiresAt ? new Date(expiresAt) : null
                },
                create: {
                    discordId,
                    username,
                    email,
                    avatar,
                    discordAccessToken: accessToken,
                    discordRefreshToken: refreshToken,
                    discordTokenExpiresAt: expiresAt ? new Date(expiresAt) : null,
                    currentPlanId: freePlanId
                }
            });

            return res.status(StatusCodes.OK).send({
                id: user.id,
                discordId: user.discordId,
                avatar: user.avatar
            });
        } catch (error) {
            app.log.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: "Failed to sync user" });
        }
    });
}