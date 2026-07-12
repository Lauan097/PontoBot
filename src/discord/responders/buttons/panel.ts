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
    ModalSubmitInteraction,
    SectionBuilder,
    SeparatorBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder
} from "discord.js";
import { prisma } from "#database";
import {
    MemberStatus,
    PointSessionStatus
} from "#enums";
import { formatDuration, getOrCreateGuildMember, icon } from "#functions";

const buttonConfig = {
  Active: {
    customId: "/point/pause",
    style: ButtonStyle.Secondary,
    emoji: icon.pause.toString(),
    label: "Pausar Serviço",
  },
  Paused: {
    customId: "/point/resume",
    style: ButtonStyle.Primary,
    emoji: icon.replay.toString(),
    label: "Retomar Serviço",
  },
  Finished: {
    customId: "/point/open",
    style: ButtonStyle.Success,
    emoji: icon.play.toString(),
    label: "Iniciar Serviço",
  }
};

export async function panel(interaction: ButtonInteraction | ModalSubmitInteraction) {

    if (!interaction.inGuild()) {
        await interaction.followUp({
            embeds: [{
                description: "Você precisa estar em um servidor.",
                color: Colors.Red
            }],
            flags: ["Ephemeral"]
        });
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

    const { member, guild } = result;

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

    const currentSession = await prisma.pointSession.findFirst({
        where: {
            memberId: member.id,
            status: {
                in: [PointSessionStatus.active, PointSessionStatus.paused]
            }
        },
        include: {
            pauses: true
        }
    }).catch((e) => {
        console.error("[PANEL] Erro ao buscar sessão atual:", (e.stack || e))
        return null
    })

    const allSessions = await prisma.pointSession.findMany({
        where: {
            memberId: member.id,
            status: PointSessionStatus.finished
        }
    }).catch((e) => {
        console.error("[PANEL] Erro ao buscar sessões:", (e.stack || e))
        return null
    })

    const sessionsList = allSessions || [];

    const totalSessions = sessionsList.length;
    const totalAccumulatedSeconds = sessionsList.reduce((acc, s) => acc + (s.totalSeconds || 0), 0);
    const uniqueDays = new Set(sessionsList.map(s => {
        const date = new Date(s.startedAt);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }));
    const daysCount = uniqueDays.size || 1;
    const dailyAverageSeconds = Math.round(totalAccumulatedSeconds / daysCount);

    let lastSessionText = "**Não encontrada**";
    if (sessionsList.length > 0) {
        const lastSession = sessionsList.reduce((latest, current) => {
            if (!latest.endedAt) return current;
            if (!current.endedAt) return latest;
            return current.endedAt.getTime() > latest.endedAt.getTime() ? current : latest;
        });
        if (lastSession.endedAt) {
            lastSessionText = `<t:${Math.floor(lastSession.endedAt.getTime() / 1000)}:R>`;
        }
    }

    let statusText = "🔴 Fora de Serviço";
    let currentSessionTimeText = "";
    let isCurrentlyActiveOrPaused = false;
    let currentSessionSeconds = 0;

    if (currentSession) {
        isCurrentlyActiveOrPaused = true;
        if (currentSession.status === PointSessionStatus.active) {
            statusText = "🟢 Em Serviço";
        } else if (currentSession.status === PointSessionStatus.paused) {
            statusText = "🟡 Pausado";
        }

        const now = Date.now();
        const totalElapsed = Math.floor((now - currentSession.startedAt.getTime()) / 1000);
        let totalPauseDuration = 0;
        for (const pause of currentSession.pauses) {
            if (pause.endedAt) {
                totalPauseDuration += Math.floor((pause.endedAt.getTime() - pause.startedAt.getTime()) / 1000);
            } else if (pause.status === 'active') {
                totalPauseDuration += Math.floor((now - pause.startedAt.getTime()) / 1000);
            }
        }
        currentSessionSeconds = Math.max(0, totalElapsed - totalPauseDuration);
        currentSessionTimeText = formatDuration(currentSessionSeconds);
    }

    const weeklyGoalActive = member.weeklyGoalActive ?? guild.settings?.weeklyGoalActive ?? false;
    let weeklyGoalContent = "";

    if (weeklyGoalActive) {
        const now = new Date();
        const startOfWeek = new Date(now);

        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        const endOfWeekTimestamp = Math.floor(endOfWeek.getTime() / 1000);

        const weeklySessions = sessionsList.filter(s => {
            if (!s.startedAt || !s.endedAt) return false;
            return s.startedAt.getTime() >= startOfWeek.getTime() && s.endedAt.getTime() < endOfWeek.getTime();
        });

        const weeklyGoalSeconds = member.weeklyGoalSeconds || guild.settings?.weeklyGoalSeconds || 0;
        const weeklyAccumulatedSeconds = weeklySessions.reduce((acc, s) => acc + (s.totalSeconds || 0), 0);
        
        const isCurrentSessionInThisWeek = currentSession && currentSession.startedAt.getTime() >= startOfWeek.getTime();
        const weeklyTotalSeconds = weeklyAccumulatedSeconds + (isCurrentSessionInThisWeek ? currentSessionSeconds : 0);
        const weeklyRemainingSeconds = Math.max(0, weeklyGoalSeconds - weeklyTotalSeconds);
        const weeklyPercentage = weeklyGoalSeconds > 0 ? Math.min(100, (weeklyTotalSeconds / weeklyGoalSeconds) * 100) : 0;
        const porcentagemParaBarra = weeklyPercentage;

        const blockSize = 100 / 12;
        const progressBarArray = [];
        for (let i = 1; i <= 12; i++) {
            const limiteDoBloco = i * blockSize;
            const progressoNoBloco = porcentagemParaBarra - (i - 1) * blockSize;

            if (porcentagemParaBarra >= limiteDoBloco) {
                progressBarArray.push(icon["100p"]?.toString() || "");
            } else if (progressoNoBloco > 0) {
                if (progressoNoBloco >= blockSize * 0.7) {
                    progressBarArray.push(icon["75p"]?.toString() || "");
                } else if (progressoNoBloco >= blockSize * 0.4) {
                    progressBarArray.push(icon["50p"]?.toString() || "");
                } else {
                    progressBarArray.push(icon["25p"]?.toString() || "");
                }
            } else {
                progressBarArray.push(icon["00p"]?.toString() || "");
            }
        }

        const barraDeProgresso = progressBarArray.join("");

        let fraseMotivacional = "";
        if (weeklyPercentage >= 100) {
            fraseMotivacional = "Meta concluída! Tire um dia de folga.";
        } else if (weeklyPercentage >= 80) {
            fraseMotivacional = "Na reta final! Você está quase lá!";
        } else if (weeklyPercentage >= 60) {
            fraseMotivacional = "Falta pouco, quase lá!";
        } else if (weeklyPercentage >= 50) {
            fraseMotivacional = "Metade do caminho já foi!";
        } else if (weeklyPercentage >= 30) {
            fraseMotivacional = "Quase na metade!";
        } else if (weeklyPercentage >= 0.1) {
            fraseMotivacional = "Continue nesse pique!";
        } else {
            fraseMotivacional = "Que tal começar agora?";
        }

        weeklyGoalContent = "### Meta Semanal" +
            `\n- Meta da semana: **${formatDuration(weeklyGoalSeconds)}**` +
            `\n- Tempo atual: **${formatDuration(weeklyTotalSeconds)}**` +
            (weeklyRemainingSeconds > 0 ? `\n- Tempo restante: **${formatDuration(weeklyRemainingSeconds)}**` : "") +
            `\n- Termina <t:${endOfWeekTimestamp}:R>` +
            `\n\n${barraDeProgresso} **(${weeklyPercentage.toFixed(1)}%)**` +
            `\n\n> ${fraseMotivacional}`;
    }

    let startButtonState = buttonConfig.Finished;
    if (currentSession) {
        if (currentSession.status === PointSessionStatus.active) {
            startButtonState = buttonConfig.Active;
        } else if (currentSession.status === PointSessionStatus.paused) {
            startButtonState = buttonConfig.Paused;
        }
    }

    const panel = new ContainerBuilder().addSectionComponents(
        new SectionBuilder()
        .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(interaction.user.displayAvatarURL())
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## ${icon.work} Olá, ${interaction.user.globalName || interaction.user.username}!` +
                `\n> - Última sessão: ${lastSessionText}` +
                `\n> - Total de sessões: **${totalSessions}**` +
                `\n> - Tempo total acumulado: **${formatDuration(totalAccumulatedSeconds)}**`
            )
        )
    )
    .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(2)
    )
    .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            "### Informações" +
            `\n- Status atual: \` ${statusText} \`` +
            (isCurrentlyActiveOrPaused ? `\n- Tempo da sessão atual: **${currentSessionTimeText}**` : "") +
            `\n- Média diária: **${formatDuration(dailyAverageSeconds)}**` +
            "\n- Posição no ranking semanal: **Em breve...**" +
            "\n\u200b"
        )
    )
    .addActionRowComponents(
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
            new ButtonBuilder()
            .setCustomId(startButtonState.customId)
            .setLabel(startButtonState.label)
            .setEmoji(startButtonState.emoji)
            .setStyle(startButtonState.style),
            new ButtonBuilder()
            .setCustomId("/point/close")
            .setLabel("Encerrar Serviço")
            .setEmoji(icon.stop.toString())
            .setStyle(ButtonStyle.Danger)
            .setDisabled(!isCurrentlyActiveOrPaused),
            new ButtonBuilder()
            .setCustomId("/point/refresh")
            .setEmoji(icon.refresh.toString())
            .setStyle(ButtonStyle.Secondary)
        )
    );

    if (weeklyGoalActive) {
        panel.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(2)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(weeklyGoalContent)
        );
    }

    await interaction.editReply({
        components: [panel],
        flags: ["IsComponentsV2"]
    });
}

createResponder({
    customId: "/point/panel",
    types: [ResponderType.Button],
    async run(interaction) {
        await interaction.deferReply({ flags: ["Ephemeral"] })
        await panel(interaction);
    }
})

createResponder({
    customId: "/point/refresh",
    types: [ResponderType.Button],
    async run(interaction) {
        await interaction.deferUpdate()
        await panel(interaction);
    }
})