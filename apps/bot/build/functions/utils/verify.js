import { prisma } from "#database";
const messages = {
  no_guild: "Este comando s\xF3 pode ser usado dentro de um servidor.",
  not_in_guild: "Voc\xEA n\xE3o \xE9 um membro deste servidor.",
  guild_not_registered: "Este servidor n\xE3o est\xE1 registrado no sistema.",
  member_error: "Ocorreu um erro ao processar seu registro. Tente novamente."
};
async function getOrCreateGuildMember(interaction, guildId, userId) {
  if (!interaction.inGuild()) {
    return { success: false, reason: messages["no_guild"] };
  }
  const existingGuild = await prisma.guild.findUnique({
    where: { discordId: guildId },
    include: { settings: true }
  }).catch((e) => {
    console.error("[getOrCreateGuildMember] Erro ao buscar guild:", e.stack || e);
    return null;
  });
  if (existingGuild && !existingGuild.active) {
    return { success: false, reason: messages["guild_not_registered"] };
  }
  let guild = existingGuild;
  if (!guild) {
    const discordGuild = interaction.guild;
    if (!discordGuild) {
      return { success: false, reason: messages["guild_not_registered"] };
    }
    guild = await prisma.guild.create({
      data: {
        discordId: discordGuild.id,
        name: discordGuild.name,
        icon: discordGuild.iconURL() ?? void 0,
        ownerDiscordId: discordGuild.ownerId
      },
      include: { settings: true }
    }).catch((e) => {
      console.error("[getOrCreateGuildMember] Erro ao criar guild:", e.stack || e);
      return null;
    });
    if (!guild) {
      return { success: false, reason: messages["guild_not_registered"] };
    }
  }
  const activeGuild = guild;
  const discordMember = await interaction.guild?.members.fetch(userId).catch(() => null);
  if (!discordMember) {
    return { success: false, reason: messages["not_in_guild"] };
  }
  let member = await prisma.member.findUnique({
    where: {
      discordId_guildId: { discordId: userId, guildId: activeGuild.id }
    }
  }).catch((e) => {
    console.error("[getOrCreateGuildMember] Erro ao buscar membro:", e.stack || e);
    return null;
  });
  if (!member) {
    member = await prisma.member.create({
      data: {
        guildId: activeGuild.id,
        discordId: userId,
        discordTag: discordMember.displayName,
        discordAvatar: discordMember.displayAvatarURL()
      }
    }).catch(async (e) => {
      if (e.code === "P2002") {
        return prisma.member.findUnique({
          where: { discordId_guildId: { discordId: userId, guildId: activeGuild.id } }
        }).catch(() => null);
      }
      console.error("[getOrCreateGuildMember] Erro ao criar membro:", e.stack || e);
      return null;
    });
  }
  if (!member) {
    return { success: false, reason: messages["member_error"] };
  }
  return { success: true, guild: activeGuild, member, discordMember };
}
export {
  getOrCreateGuildMember
};
