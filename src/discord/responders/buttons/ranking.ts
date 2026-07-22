import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Colors,
    ContainerBuilder,
    MessageActionRowComponentBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder
} from "discord.js";
import { prisma } from "#database";
import { PointSessionStatus } from "#enums";
import { formatDuration, icon } from "#functions";

export async function sendRanking(interaction: ButtonInteraction, type: "weekly" | "all") {
    if (!interaction.inGuild()) {
        await interaction.editReply({
            embeds: [
                {
                    description: "Você precisa estar em um servidor.",
                    color: Colors.Red
                }
            ]
        });
        return;
    }

    const guildId = interaction.guildId;

    const whereFinished: any = {
        member: {
            guild: {
                discordId: guildId
            }
        },
        status: PointSessionStatus.finished
    };

    const whereActive: any = {
        member: {
            guild: {
                discordId: guildId
            }
        },
        status: {
            in: [PointSessionStatus.active, PointSessionStatus.paused]
        }
    };

    let periodText = "";
    if (type === "weekly") {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        whereFinished.startedAt = {
            gte: startOfWeek,
            lt: endOfWeek
        };

        whereActive.startedAt = {
            gte: startOfWeek,
            lt: endOfWeek
        };

        const startOfWeekTimestamp = Math.floor(startOfWeek.getTime() / 1000);
        const endOfWeekTimestamp = Math.floor(endOfWeek.getTime() / 1000);
        periodText = `\n> Período: <t:${startOfWeekTimestamp}:d> até <t:${endOfWeekTimestamp}:d>`;
    } else {
        periodText = `\n> Período: Geral (Desde o início)`;
    }

    const finishedSessions = await prisma.pointSession.findMany({
        where: whereFinished,
        select: {
            totalSeconds: true,
            member: {
                select: {
                    discordId: true
                }
            }
        }
    });

    const activeSessions = await prisma.pointSession.findMany({
        where: whereActive,
        select: {
            startedAt: true,
            status: true,
            member: {
                select: {
                    discordId: true
                }
            },
            pauses: {
                select: {
                    startedAt: true,
                    endedAt: true,
                    status: true
                }
            }
        }
    });

    const memberSecondsMap = new Map<string, number>();

    for (const session of finishedSessions) {
        const discordId = session.member.discordId;
        const seconds = session.totalSeconds || 0;
        memberSecondsMap.set(discordId, (memberSecondsMap.get(discordId) || 0) + seconds);
    }

    const nowMs = Date.now();
    for (const session of activeSessions) {
        const discordId = session.member.discordId;
        const totalElapsed = Math.floor((nowMs - session.startedAt.getTime()) / 1000);
        let totalPauseDuration = 0;
        for (const pause of session.pauses) {
            if (pause.endedAt) {
                totalPauseDuration += Math.floor((pause.endedAt.getTime() - pause.startedAt.getTime()) / 1000);
            } else if (pause.status === 'active') {
                totalPauseDuration += Math.floor((nowMs - pause.startedAt.getTime()) / 1000);
            }
        }
        const currentSessionSeconds = Math.max(0, totalElapsed - totalPauseDuration);
        memberSecondsMap.set(discordId, (memberSecondsMap.get(discordId) || 0) + currentSessionSeconds);
    }

    const sortedMembers = Array.from(memberSecondsMap.entries())
        .map(([discordId, totalSeconds]) => ({ discordId, totalSeconds }))
        .sort((a, b) => b.totalSeconds - a.totalSeconds);

    let rankingText = "";
    if (sortedMembers.length === 0) {
        rankingText = "\n*Nenhum registro de ponto encontrado para este período.*";
    } else {
        const top10 = sortedMembers.slice(0, 10);
        const lines = top10.map((entry, index) => {
            const position = index + 1;
            let emojiPrefix = `\`#${position}\``;
            if (position === 1) emojiPrefix = `${icon.crown}`;
            else if (position === 2) emojiPrefix = "🥈";
            else if (position === 3) emojiPrefix = "🥉";

            return `- ${emojiPrefix} <@${entry.discordId}> — **${formatDuration(entry.totalSeconds)}**`;
        });
        rankingText = "\n" + lines.join("\n");
    }

    const titleText = type === "weekly" ? "Ranking Semanal" : "Ranking Geral";
    const refreshCustomId = `/point/ranking/${type}/refresh`;

    const rankingContainer = new ContainerBuilder()
        .addSectionComponents(
            new SectionBuilder()
                .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(interaction.guild?.iconURL() || interaction.user.displayAvatarURL())
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `## ${icon.medals} ${titleText} — ${interaction.guild?.name}` +
                        `${periodText}` +
                        `\n${rankingText}`
                    )
                )
        )
        .addActionRowComponents(
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(refreshCustomId)
                    .setLabel("Atualizar")
                    .setEmoji(icon.refresh.toString())
                    .setStyle(ButtonStyle.Secondary)
            )
        );

    await interaction.editReply({
        components: [rankingContainer],
        flags: ["IsComponentsV2"]
    });
}

createResponder({
    customId: "/point/ranking/weekly",
    types: [ResponderType.Button],
    async run(interaction) {
        await interaction.deferReply({ flags: ["Ephemeral"] });
        await sendRanking(interaction, "weekly");
    }
});

createResponder({
    customId: "/point/ranking/weekly/refresh",
    types: [ResponderType.Button],
    async run(interaction) {
        await interaction.deferUpdate();
        await sendRanking(interaction, "weekly");
    }
});

createResponder({
    customId: "/point/ranking/all",
    types: [ResponderType.Button],
    async run(interaction) {
        await interaction.deferReply({ flags: ["Ephemeral"] });
        await sendRanking(interaction, "all");
    }
});

createResponder({
    customId: "/point/ranking/all/refresh",
    types: [ResponderType.Button],
    async run(interaction) {
        await interaction.deferUpdate();
        await sendRanking(interaction, "all");
    }
});


