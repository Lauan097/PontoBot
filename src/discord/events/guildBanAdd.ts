import { createEvent } from "#base";
import { prisma } from "#database";
import { MemberFlowAction, MemberStatus } from "#enums";

createEvent({
    name: "New Ban Added",
    event: "guildBanAdd",
    async run(ban) {
        const guild = await prisma.guild
            .findUnique({
                where: {
                    discordId: ban.guild.id,
                    active: true
                }
            })
            .catch((e) => {
                console.error(
                    "[GUILD BAN ADD] Erro ao buscar guild:",
                    e.stack || e
                );
                return null;
            });

        if (!guild) return;

        await prisma
            .$transaction([
                prisma.member.updateMany({
                    where: {
                        discordId: ban.user.id,
                        guildId: guild.id
                    },
                    data: {
                        status: MemberStatus.banned
                    }
                }),
                prisma.memberFlow.create({
                    data: {
                        guildId: guild.id,
                        userId: ban.user.id,
                        userTag: ban.user.tag,
                        action: MemberFlowAction.ban
                    }
                })
            ])
            .catch((e) => {
                console.error(
                    "[GUILD BAN ADD] Erro na transaction:",
                    e.stack || e
                );
            });
    }
});
