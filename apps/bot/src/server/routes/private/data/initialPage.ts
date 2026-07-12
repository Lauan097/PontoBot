import { Client, PermissionFlagsBits } from "discord.js"
import { FastifyInstance } from "fastify"
import { StatusCodes } from "http-status-codes"
import { authenticate } from "../../../hooks/auth.js"
import { isAdmin } from "../../../hooks/isAdmin.js"

export function initialPageRoute(app: FastifyInstance, client: Client) {
    app.get("/initial-page/:guildId", { preHandler: authenticate }, async (req, res) => {
        try {
            const { guildId } = req.params as { guildId: string };
            const { user } = req;

            // 1. Verificar se o usuário é administrador ou dono do servidor solicitado
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

            // 2. Buscar a lista de servidores compartilhados diretamente do cache do bot
            const guildPromises = Array.from(client.guilds.cache.values()).map(async (guild) => {
                try {
                    const member = await guild.members.fetch(user.discordId);
                    const isUserAdmin = guild.ownerId === user.discordId || member.permissions.has(PermissionFlagsBits.Administrator);
                    
                    if (isUserAdmin) {
                        return {
                            id: guild.id,
                            name: guild.name,
                            logo: guild.icon 
                                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                                : "https://cdn.discordapp.com/embed/avatars/0.png",
                            plan: `${guild.memberCount} membros`
                        };
                    }
                } catch {
                    // Se o usuário não for membro deste servidor, o fetch falha e ignoramos
                }
                return undefined;
            });

            const results = await Promise.all(guildPromises);
            const sharedGuilds = results.filter((g): g is NonNullable<typeof g> => g !== undefined);

            // 3. Montar o perfil do usuário
            const cachedUser = client.users.cache.get(user.discordId);
            const userProfile = {
                name: cachedUser?.displayName || user.username,
                avatar: cachedUser?.avatarURL() || (user.avatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png` : null),
                email: user.email
            };

            return res.status(StatusCodes.OK).send({
                user: userProfile,
                servers: sharedGuilds
            });

        } catch (error) {
            app.log.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: "Failed to fetch initial page data" });
        }
    });
}