import { StatusCodes } from "http-status-codes";
import { authenticate } from "../../../hooks/auth.js";
const ADMINISTRATOR_FLAG = 0x8n;
function guildsRoute(app, client) {
  app.get("/guilds", { preHandler: authenticate }, async (req, res) => {
    try {
      const { user } = req;
      const discordRes = await fetch("https://discord.com/api/v10/users/@me/guilds", {
        headers: {
          Authorization: `Bearer ${user.discordAccessToken}`
        }
      });
      if (!discordRes.ok) {
        app.log.error(`Discord API returned status ${discordRes.status}: ${await discordRes.text()}`);
        return res.status(StatusCodes.UNAUTHORIZED).send({ error: "Discord authentication failed or token expired" });
      }
      const guilds = await discordRes.json();
      const userGuilds = guilds.filter((guild) => {
        if (guild.owner) return true;
        const permissions = BigInt(guild.permissions);
        return (permissions & ADMINISTRATOR_FLAG) === ADMINISTRATOR_FLAG;
      }).map((guild) => {
        const botGuild = client.guilds.cache.get(guild.id);
        return {
          id: guild.id,
          name: guild.name,
          icon: guild.icon,
          hasBot: !!botGuild,
          memberCount: botGuild?.memberCount ?? null
        };
      });
      const cachedUser = client.users.cache.get(user.discordId);
      const userProfile = {
        name: cachedUser?.displayName || user.username,
        avatar: cachedUser?.avatarURL() || (user.avatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png` : null)
      };
      return res.status(StatusCodes.OK).send({
        guilds: userGuilds,
        user: userProfile
      });
    } catch (error) {
      app.log.error(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: "Failed to fetch servers" });
    }
  });
}
export {
  guildsRoute
};
