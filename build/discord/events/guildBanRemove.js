import { createEvent } from "#base";
import { prisma } from "#database";
import { MemberStatus } from "#enums";
createEvent({
  name: "Guild Ban Revoke",
  event: "guildBanRemove",
  async run(ban) {
    const guild = await prisma.guild.findUnique({
      where: {
        discordId: ban.guild.id,
        active: true
      }
    }).catch((e) => {
      console.error("[GUILD BAN REMOVE] Erro ao buscar guild:", e.stack || e);
      return null;
    });
    if (!guild) return;
    await prisma.member.updateMany({
      where: {
        discordId: ban.user.id,
        guildId: guild.id
      },
      data: {
        status: MemberStatus.out_of_server
      }
    }).catch((e) => {
      console.error("[GUILD BAN REMOVE] Erro ao atualizar member:", e.stack || e);
    });
  }
});
