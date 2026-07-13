import { PermissionFlagsBits } from "discord.js";
import { StatusCodes } from "http-status-codes";
import { authenticate } from "../../../hooks/auth.js";
import { isAdmin } from "../../../hooks/isAdmin.js";
function initialPageRoute(app, client) {
  app.get("/initial-page/:guildId", { preHandler: authenticate }, async (req, res) => {
    try {
      const { guildId } = req.params;
      const { user } = req;
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
      const guildPromises = Array.from(client.guilds.cache.values()).map(async (guild) => {
        try {
          const member = await guild.members.fetch(user.discordId);
          const isUserAdmin = guild.ownerId === user.discordId || member.permissions.has(PermissionFlagsBits.Administrator);
          if (isUserAdmin) {
            return {
              id: guild.id,
              name: guild.name,
              logo: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : "https://cdn.discordapp.com/embed/avatars/0.png",
              plan: `${guild.memberCount} membros`
            };
          }
        } catch {
        }
        return void 0;
      });
      const results = await Promise.all(guildPromises);
      const sharedGuilds = results.filter((g) => g !== void 0);
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
export {
  initialPageRoute
};
