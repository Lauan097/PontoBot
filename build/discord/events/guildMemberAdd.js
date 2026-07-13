import { createEvent } from "#base";
import { prisma } from "#database";
import { MemberFlowAction, MemberStatus } from "#enums";
createEvent({
  name: "Member Join",
  event: "guildMemberAdd",
  async run(member) {
    const guild = await prisma.guild.findUnique({
      where: {
        discordId: member.guild.id,
        active: true
      }
    }).catch((e) => {
      console.error("Erro ao buscar guild no evento guildMemberAdd: ", e.stack || e);
      return null;
    });
    if (guild) {
      await prisma.$transaction([
        prisma.member.upsert({
          where: {
            discordId_guildId: {
              discordId: member.id,
              guildId: guild.id
            }
          },
          update: {
            discordTag: member.displayName,
            discordAvatar: member.displayAvatarURL(),
            status: MemberStatus.active
          },
          create: {
            guildId: guild.id,
            discordId: member.id,
            discordTag: member.displayName,
            discordAvatar: member.displayAvatarURL()
          }
        }),
        prisma.memberFlow.create({
          data: {
            guildId: guild.id,
            userId: member.id,
            userTag: member.displayName,
            action: MemberFlowAction.join
          }
        })
      ]).catch((e) => {
        console.error("Erro na transaction do evento GuildMemberAdd: ", e.stack || e);
      });
    }
  }
});
