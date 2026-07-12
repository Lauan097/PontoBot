import { createEvent } from "#base"
import { prisma } from "#database"
import { MemberStatus, MemberFlowAction } from "#enums"

createEvent({
    name: "Member Leave",
    event: "guildMemberRemove",
    async run(member) {

        const guild = await prisma.guild.findUnique({
            where: {
                discordId: member.guild.id,
                active: true
            }
        }).catch((e) => {
            console.error("[GUILD MEMBER REMOVE] Erro ao buscar guild:", e.stack || e)
            return null
        })

        if (!guild) return

        const banEntry = await member.guild.bans.fetch(member.id).catch(() => null)

        if (banEntry) return

        await prisma.$transaction([
            prisma.member.updateMany({
                where: {
                    discordId: member.id,
                    guildId: guild.id
                },
                data: {
                    status: MemberStatus.out_of_server
                }
            }),
            prisma.memberFlow.create({
                data: {
                    guildId: guild.id,
                    userId: member.id,
                    userTag: member.user.tag,
                    action: MemberFlowAction.leave
                }
            })
        ]).catch((e) => {
            console.error("[GUILD MEMBER REMOVE] Erro na transaction:", e.stack || e)
        })
    }
})