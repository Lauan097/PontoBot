import { createResponder } from "#base"
import { prisma } from "#database"
import { ResponderType } from "@constatic/base"
import { 
    ChannelType,
    Colors,
    ContainerBuilder,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    ThumbnailBuilder
} from "discord.js"
import {
    MemberStatus,
    PointSessionStatus
} from "#enums"
import { panel } from "../../buttons/panel.js"
import { getOrCreateGuildMember, icon } from "#functions"

createResponder({
    customId: "/point/open/modal",
    types: [ResponderType.ModalComponent],
    async run(interaction) {
        await interaction.deferUpdate()

        try {

            const participants = (interaction.fields.getSelectedUsers("participants")?.map((user) => user.id) || [])
                .filter((id) => id !== interaction.user.id)
            const anotations = interaction.fields.getTextInputValue("anotations")

            if (!interaction.inGuild()) {
                await interaction.followUp({
                    embeds: [{
                        description: "Este comando só pode ser usado dentro de um servidor.",
                        color: Colors.Red
                    }],
                    flags: ["Ephemeral"]
                })
                return;
            }

            const result = await getOrCreateGuildMember(interaction, interaction.guildId, interaction.user.id)

            if (!result.success) {
                await interaction.followUp({
                    embeds: [{
                        description: result.reason,
                        color: Colors.Red
                    }],
                    flags: ["Ephemeral"]
                })
                return;
            }

            const { guild, member, discordMember } = result

            if (member.status === MemberStatus.banned) {
                await interaction.followUp({
                    embeds: [{
                        description: "Você não pode bater ponto neste servidor.",
                        color: Colors.Red
                    }],
                    flags: ["Ephemeral"]
                })
                return;
            }

            const activeSession = await prisma.pointSession.findFirst({
                where: {
                    memberId: member.id,
                    status: PointSessionStatus.active
                }
            })

            if (activeSession) {
                await interaction.followUp({
                    embeds: [{
                        description: "Você já possui um ponto ativo.",
                        color: Colors.Red
                    }],
                    flags: ["Ephemeral"]
                })
                return;
            }

            const weeklyGoalActive = member.weeklyGoalActive ?? guild.settings?.weeklyGoalActive ?? false;
            const weeklyGoalSecondsSnapshot = weeklyGoalActive ? (member.weeklyGoalSeconds ?? guild.settings?.weeklyGoalSeconds) : null;

            // Suspensa enquanto o Discord não aprovar o uso da intent necessária
            // const activity = discordMember.presence?.activities?.filter((a) => a.type !== 4 && a.type !== 5).map((a) => a.name).join(", ") || null
            const voiceCh = discordMember.voice.channel?.id

            const session = await prisma.pointSession.create({
                data: {
                    memberId: member.id,
                    startedAt: new Date(),
                    status: PointSessionStatus.active,
                    weeklyGoalSecondsSnapshot,
                    initialParticipantsIds: participants,
                    participantsCount: participants.length,
                    initialNotes: anotations || "Nenhuma nota inicial",
                    activity: null,
                    voiceChannelId: voiceCh ?? null
                }
            })

            const channelId = guild.settings?.pointOpenLogChannelId

            if (channelId) {
                const ch = await interaction.client.channels.fetch(channelId).catch(() => null)
                
                if (ch && ch.type === ChannelType.GuildText) {
                    const m = await ch.send({
                        components: [
                            new ContainerBuilder()
                            .setAccentColor(Colors.Green)
                            .addSectionComponents(
                                new SectionBuilder()
                                .setThumbnailAccessory(
                                    new ThumbnailBuilder().setURL(discordMember.displayAvatarURL())
                                )
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder().setContent(
                                        `## ${icon.login} Expediente Iniciado\u3164\n` +
                                        `- Aberto por ${discordMember}\n` +
                                        `- Iniciado <t:${Math.floor(Date.now() / 1000)}:R>`
                                    )
                                )
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
                            )
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(
                                    "### Informações\n" +
                                    `- Canal de voz — ${voiceCh ? `<#${voiceCh}>` : "**Nenhum**"}\n` +
                                    `- Atividade — **Nenhuma**\n\n` +
                                    `- **Participantes:** ${participants.length > 0 ? `\n  - ${participants.map((id) => `<@${id}>`).join("\n  - ")}` : "Nenhum"}`
                                )
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
                            )
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(
                                    `- **Anotações iniciais**\n${anotations || "Nenhuma"}`
                                )
                            )
                        ],
                        flags: ["IsComponentsV2"]
                    })

                    if (m) await prisma.pointSession.update({
                        where: { id: session.id },
                        data: { messageOpenLink: m.url }
                    })
                }
            }

            await panel(interaction)

        } catch (e) {
            console.error("[POINT OPEN] Erro ao abrir ponto:", (e as Error).stack || e)
            await interaction.followUp({
                embeds: [{
                    description: "Ocorreu um erro ao abrir seu ponto. Tente novamente.",
                    color: Colors.Red
                }],
                flags: ["Ephemeral"]
            })
        }
    }
})
