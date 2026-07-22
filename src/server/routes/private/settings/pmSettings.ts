import { ChannelType, Client, Guild as DiscordGuild } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import { prisma } from "#database";
import { authenticate } from "../../../hooks/auth.js";
import { isAdmin } from "../../../hooks/isAdmin.js";

async function getOrCreateDbGuild(discordGuild: DiscordGuild) {
    let dbGuild = await prisma.guild.findUnique({
        where: { discordId: discordGuild.id },
        include: { settings: true }
    });

    if (!dbGuild) {
        dbGuild = await prisma.guild.create({
            data: {
                discordId: discordGuild.id,
                name: discordGuild.name,
                icon: discordGuild.iconURL() ?? undefined,
                ownerDiscordId: discordGuild.ownerId
            },
            include: { settings: true }
        });
    }

    return dbGuild;
}

export function pmSettingsRoute(app: FastifyInstance, client: Client) {
    app.get("/guilds/:guildId/pm/settings", { preHandler: authenticate }, async (req, res) => {
        try {
            const { user } = req;
            const { guildId } = req.params as { guildId: string };

            const adminCheck = await isAdmin({
                client,
                guildId,
                userId: user.discordId
            });

            if (!adminCheck.success) {
                return res.status(StatusCodes.FORBIDDEN).send({
                    error: adminCheck.error,
                    description: adminCheck.description
                });
            }

            const { guild } = adminCheck;
            const dbGuild = await getOrCreateDbGuild(guild);
            const dbSettings = dbGuild.settings;

            const channels = await guild.channels.fetch();
            const textChannels = Array.from(channels.values())
                .filter((c): c is NonNullable<typeof c> => 
                    c !== null && (c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement)
                )
                .map((c) => ({
                    id: c.id,
                    name: c.name,
                    type: c.type
                }));

            const roles = await guild.roles.fetch();
            const guildRoles = Array.from(roles.values())
                .filter((r) => r.id !== guild.id && !r.managed)
                .sort((a, b) => b.position - a.position)
                .map((r) => ({
                    id: r.id,
                    name: r.name,
                    color: r.color,
                    hexColor: r.hexColor === "#000000" ? "#99aab5" : r.hexColor
                }));

            return res.status(StatusCodes.OK).send({
                settings: {
                    weeklyGoalActive: dbSettings?.weeklyGoalActive ?? false,
                    weeklyGoalSeconds: dbSettings?.weeklyGoalSeconds ?? 0,
                    pointOpenLogChannelId: dbSettings?.pointOpenLogChannelId ?? null,
                    pointCloseLogChannelId: dbSettings?.pointCloseLogChannelId ?? null,
                    pointOpenRoleId: dbSettings?.pointOpenRoleId ?? null,
                    pointPauseRoleId: dbSettings?.pointPauseRoleId ?? null,
                    pointCloseRoleId: dbSettings?.pointCloseRoleId ?? null,
                },
                channels: textChannels,
                roles: guildRoles
            });

        } catch (error) {
            app.log.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                error: "Erro interno ao carregar configurações do servidor."
            });
        }
    });

    app.put("/guilds/:guildId/pm/settings", { preHandler: authenticate }, async (req, res) => {
        try {
            const { user } = req;
            const { guildId } = req.params as { guildId: string };

            const adminCheck = await isAdmin({
                client,
                guildId,
                userId: user.discordId
            });

            if (!adminCheck.success) {
                return res.status(StatusCodes.FORBIDDEN).send({
                    error: adminCheck.error,
                    description: adminCheck.description
                });
            }

            const { guild } = adminCheck;
            const dbGuild = await getOrCreateDbGuild(guild);

            const body = req.body as {
                weeklyGoalActive?: boolean;
                weeklyGoalSeconds?: number | null;
                pointOpenLogChannelId?: string | null;
                pointCloseLogChannelId?: string | null;
                pointOpenRoleId?: string | null;
                pointPauseRoleId?: string | null;
                pointCloseRoleId?: string | null;
            };

            const updatedSettings = await prisma.settings.upsert({
                where: { guildId: dbGuild.id },
                update: {
                    weeklyGoalActive: body.weeklyGoalActive ?? false,
                    weeklyGoalSeconds: body.weeklyGoalSeconds ?? null,
                    pointOpenLogChannelId: body.pointOpenLogChannelId ?? null,
                    pointCloseLogChannelId: body.pointCloseLogChannelId ?? null,
                    pointOpenRoleId: body.pointOpenRoleId ?? null,
                    pointPauseRoleId: body.pointPauseRoleId ?? null,
                    pointCloseRoleId: body.pointCloseRoleId ?? null,
                },
                create: {
                    guildId: dbGuild.id,
                    weeklyGoalActive: body.weeklyGoalActive ?? false,
                    weeklyGoalSeconds: body.weeklyGoalSeconds ?? null,
                    pointOpenLogChannelId: body.pointOpenLogChannelId ?? null,
                    pointCloseLogChannelId: body.pointCloseLogChannelId ?? null,
                    pointOpenRoleId: body.pointOpenRoleId ?? null,
                    pointPauseRoleId: body.pointPauseRoleId ?? null,
                    pointCloseRoleId: body.pointCloseRoleId ?? null,
                }
            });

            return res.status(StatusCodes.OK).send({
                success: true,
                settings: updatedSettings
            });

        } catch (error) {
            console.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                error: "Erro interno ao salvar configurações do servidor."
            });
        }
    });
}