import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { prisma } from "#database";
import { 
    PointSessionStatus,
    PauseStatus
} from "#enums";
import {
    Colors,
    ChannelType,
    ContainerBuilder,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    ThumbnailBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import { formatDuration, getOrCreateGuildMember, icon } from "#functions";
import { panel } from "../../buttons/panel.js";

createResponder({
    customId: "/point/close/modal",
    types: [ResponderType.ModalComponent],
    async run(interaction) {
        await interaction.deferUpdate();

        try {
            if (!interaction.inGuild()) {
                await interaction.followUp({
                    embeds: [{
                        description: "Este comando só pode ser usado dentro de um servidor.",
                        color: Colors.Red
                    }],
                    flags: ["Ephemeral"]
                });
                return;
            }

            const finalParticipants = (interaction?.fields?.getSelectedUsers("participants")?.map((user) => user.id) || [])
                .filter((id) => id !== interaction.user.id);
            const report = interaction.fields.getTextInputValue("report") || "Nenhum relatório final";

            const result = await getOrCreateGuildMember(interaction, interaction.guildId, interaction.user.id)

            if (!result.success) {
                await interaction.followUp({
                    embeds: [{
                        description: result.reason,
                        color: Colors.Red
                    }],
                    flags: ["Ephemeral"]
                });
                return;
            }

            const { guild, member } = result

            const session = await prisma.pointSession.findFirst({
                where: {
                    memberId: member.id,
                    status: {
                        in: [PointSessionStatus.active, PointSessionStatus.paused]
                    }
                },
                include: {
                    pauses: true
                }
            });

            if (!session) {
                await interaction.followUp({
                    embeds: [{
                        description: "Você não tem nenhuma sessão ativa ou pausada.",
                        color: Colors.Red
                    }],
                    flags: ["Ephemeral"]
                });
                return;
            }

            const now = new Date();
            const grossSeconds = Math.max(0, Math.floor((now.getTime() - session.startedAt.getTime()) / 1000));
            
            const activePause = session.pauses.find(p => p.status === PauseStatus.active);
            let activePauseDuration = 0;
            if (activePause) {
                activePauseDuration = Math.max(0, Math.floor((now.getTime() - activePause.startedAt.getTime()) / 1000));
            }

            let totalPauseSeconds = 0;
            for (const pause of session.pauses) {
                if (pause.endedAt) {
                    totalPauseSeconds += Math.floor((pause.endedAt.getTime() - pause.startedAt.getTime()) / 1000);
                } else if (pause.status === PauseStatus.active) {
                    totalPauseSeconds += activePauseDuration;
                }
            }

            const netSeconds = Math.max(0, grossSeconds - totalPauseSeconds);

            await prisma.$transaction(async (tx) => {
                if (activePause) {
                    await tx.pause.update({
                        where: { id: activePause.id },
                        data: {
                            status: PauseStatus.finished,
                            endedAt: now,
                            durationSeconds: activePauseDuration
                        }
                    });
                }

                await tx.pointSession.update({
                    where: { id: session.id },
                    data: {
                        status: PointSessionStatus.finished,
                        endedAt: now,
                        totalSeconds: netSeconds,
                        finalParticipantsIds: finalParticipants,
                        finalNotes: report
                    }
                });
            });

            let pausesText = `- **Número de Pausas:** ${session.pauses.length}`;
            if (session.pauses.length > 0) {
                pausesText += "\n" + session.pauses.map((p, index) => {
                    const startT = Math.floor(p.startedAt.getTime() / 1000);
                    const end = p.endedAt || now;
                    const endT = Math.floor(end.getTime() / 1000);
                    const duration = p.durationSeconds || Math.floor((end.getTime() - p.startedAt.getTime()) / 1000);
                    return `  - **${index + 1}° Pausa** — das <t:${startT}:t> até <t:${endT}:t> (Duração: **${formatDuration(duration)}**)`;
                }).join("\n");
            }

            let mCloseUrl = "https://discord.com";
            const channelId = guild.settings?.pointCloseLogChannelId;
            if (channelId) {
                const ch = await interaction.client.channels.fetch(channelId).catch(() => null);
                if (ch && ch.type === ChannelType.GuildText) {
                    const m = await ch.send({
                        components: [
                            new ContainerBuilder()
                            .setAccentColor(Colors.Red)
                            .addSectionComponents(
                                new SectionBuilder()
                                .setThumbnailAccessory(
                                    new ThumbnailBuilder().setURL(interaction.user.displayAvatarURL())
                                )
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder().setContent(
                                        `## ${icon.logout} Expediente Encerrado\n` +
                                        `- Fechado por <@${interaction.user.id}>\n` +
                                        `- Início: <t:${Math.floor(session.startedAt.getTime() / 1000)}:f>\n` +
                                        `- Término: <t:${Math.floor(now.getTime() / 1000)}:f>`
                                    )
                                )
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
                            )
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(
                                    "### Informações\n" +
                                    `- Duração Bruta — **${formatDuration(grossSeconds)}**\n` +
                                    `- Duração Líquida — **${formatDuration(netSeconds)}**\n\n` +
                                    pausesText
                                )
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
                            )
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(
                                    `- **Participantes Iniciais:** ${session.initialParticipantsIds.length > 0 ? `\n  - ${session.initialParticipantsIds.map((id) => `<@${id}>`).join("\n  - ")}` : "Nenhum"}\n\n` +
                                    `- **Participantes Finais:** ${finalParticipants.length > 0 ? `\n  - ${finalParticipants.map((id) => `<@${id}>`).join("\n  - ")}` : "Nenhum"}`
                                )
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
                            )
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(
                                    `### Relatório Final:\n${report}`
                                )
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
                            )
                            .addSectionComponents(
                                new SectionBuilder()
                                .setButtonAccessory(
                                    new ButtonBuilder()
                                    .setLabel("Log Inicial")
                                    .setStyle(ButtonStyle.Link)
                                    .setURL(session.messageOpenLink || "https://discord.com")
                                )
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder().setContent(
                                        `> Powered by **PontoBot**`
                                    )
                                )
                            )
                        ],
                        flags: ["IsComponentsV2"]
                    });

                    if (m) {
                        mCloseUrl = m.url;
                        await prisma.pointSession.update({
                            where: { id: session.id },
                            data: { messageCloseLink: m.url }
                        }).catch((e) => console.error("[POINT CLOSE MODAL] Erro ao atualizar link da mensagem:", (e.stack || e)));
                    }
                }
            }

            if (session.messageOpenLink) {
                const urlParts = session.messageOpenLink.split("/");
                const openChannelId = urlParts[urlParts.length - 2];
                const openMessageId = urlParts[urlParts.length - 1];

                const openChannel = await interaction.client.channels.fetch(openChannelId).catch(() => null);
                if (openChannel && openChannel.isTextBased()) {
                    const openMessage = await openChannel.messages.fetch(openMessageId).catch(() => null);
                    if (openMessage) {
                        const voiceCh = session.voiceChannelId;
                        const activity = session.activity || "Nenhuma";
                        const initialParticipants = session.initialParticipantsIds || [];
                        const initialNotes = session.initialNotes || "Nenhuma";

                        const updatedOpenMessageComponents = [
                            new ContainerBuilder()
                            .setAccentColor(Colors.Green)
                            .addSectionComponents(
                                new SectionBuilder()
                                .setThumbnailAccessory(
                                    new ThumbnailBuilder().setURL(interaction.user.displayAvatarURL())
                                )
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder().setContent(
                                        `## ${icon.login} Expediente Iniciado\n` +
                                        `- Aberto por <@${member.discordId}>\n` +
                                        `- Iniciado <t:${Math.floor(session.startedAt.getTime() / 1000)}:R>\n` +
                                        `- Finalizado <t:${Math.floor(now.getTime() / 1000)}:R>`
                                    )
                                )
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
                            )
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(
                                    "### Informações\n" +
                                    `- Canal de voz — ${voiceCh && voiceCh !== "Nenhum" ? `<#${voiceCh}>` : "**Nenhum**"}\n` +
                                    `- Atividade — **${activity}**\n\n` +
                                    `- **Participantes:** ${initialParticipants.length > 0 ? `\n  - ${initialParticipants.map((id) => `<@${id}>`).join("\n  - ")}` : "Nenhum"}`
                                )
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
                            )
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(
                                    `- **Anotações iniciais**\n${initialNotes}`
                                )
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
                            )
                            .addSectionComponents(
                                new SectionBuilder()
                                .setButtonAccessory(
                                    new ButtonBuilder()
                                    .setLabel("Log Final")
                                    .setStyle(ButtonStyle.Link)
                                    .setURL(mCloseUrl)
                                )
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder().setContent(`> ${icon.check} Expediente finalizado`)
                                )
                            )
                        ];

                        await openMessage.edit({
                            components: updatedOpenMessageComponents,
                            flags: ["IsComponentsV2"]
                        }).catch((err) => console.error("[POINT CLOSE MODAL] Erro ao editar mensagem de início:", err));
                    }
                }
            }

            await panel(interaction);

        } catch (e) {
            console.error("[POINT CLOSE]", e);
            await interaction.followUp({
                embeds: [{
                    description: "Ocorreu um erro ao encerrar sua sessão.",
                    color: Colors.Red
                }],
                flags: ["Ephemeral"]
            });
        }
    }
});