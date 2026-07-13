import { PermissionFlagsBits } from "discord.js";
async function isAdmin({
  client,
  guildId,
  userId
}) {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    return {
      success: false,
      error: "Servidor n\xE3o encontrado.",
      description: "O servidor n\xE3o foi encontrado na lista de servidores do bot."
    };
  }
  try {
    const member = await guild.members.fetch(userId);
    const isAdmin2 = guild.ownerId === userId || member.permissions.has(PermissionFlagsBits.Administrator);
    if (!isAdmin2) {
      return {
        success: false,
        error: "Acesso n\xE3o autorizado.",
        description: "Voc\xEA n\xE3o tem permiss\xE3o de administrador neste servidor."
      };
    }
    return {
      success: true,
      guild
    };
  } catch {
    return {
      success: false,
      error: "Membro n\xE3o encontrado.",
      description: "N\xE3o foi poss\xEDvel obter os dados do membro."
    };
  }
}
export {
  isAdmin
};
