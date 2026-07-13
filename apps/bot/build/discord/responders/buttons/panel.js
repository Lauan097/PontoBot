import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  ContainerBuilder,
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
    label: "Pausar Servi\xE7o"
  },
  Paused: {
    customId: "/point/resume",
    style: ButtonStyle.Primary,
    emoji: icon.replay.toString(),
    label: "Retomar Servi\xE7o"
  },
  Finished: {
    customId: "/point/open",
    style: ButtonStyle.Success,
    emoji: icon.play.toString(),
    label: "Iniciar Servi\xE7o"
  }
};
async function panel(interaction) {
  if (!interaction.inGuild()) {
    await interaction.followUp({
      embeds: [{
        description: "Voc\xEA precisa estar em um servidor.",
        color: Colors.Red
      }],
      flags: ["Ephemeral"]
    });
    return;
  }
  const result = await getOrCreateGuildMember(interaction, interaction.guildId, interaction.user.id);
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
  const { member, guild } = result;
  if (member.status === MemberStatus.banned) {
    await interaction.followUp({
      embeds: [{
        description: "Voc\xEA n\xE3o pode bater ponto neste servidor.",
        color: Colors.Red
      }],
      flags: ["Ephemeral"]
    });
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
    console.error("[PANEL] Erro ao buscar sess\xE3o atual:", e.stack || e);
    return null;
  });
  const allSessions = await prisma.pointSession.findMany({
    where: {
      memberId: member.id,
      status: PointSessionStatus.finished
    }
  }).catch((e) => {
    console.error("[PANEL] Erro ao buscar sess\xF5es:", e.stack || e);
    return null;
  });
  const sessionsList = allSessions || [];
  const totalSessions = sessionsList.length;
  const totalAccumulatedSeconds = sessionsList.reduce((acc, s) => acc + (s.totalSeconds || 0), 0);
  const uniqueDays = new Set(sessionsList.map((s) => {
    const date = new Date(s.startedAt);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }));
  const daysCount = uniqueDays.size || 1;
  const dailyAverageSeconds = Math.round(totalAccumulatedSeconds / daysCount);
  let lastSessionText = "**N\xE3o encontrada**";
  if (sessionsList.length > 0) {
    const lastSession = sessionsList.reduce((latest, current) => {
      if (!latest.endedAt) return current;
      if (!current.endedAt) return latest;
      return current.endedAt.getTime() > latest.endedAt.getTime() ? current : latest;
    });
    if (lastSession.endedAt) {
      lastSessionText = `<t:${Math.floor(lastSession.endedAt.getTime() / 1e3)}:R>`;
    }
  }
  let statusText = "\u{1F534} Fora de Servi\xE7o";
  let currentSessionTimeText = "";
  let isCurrentlyActiveOrPaused = false;
  let currentSessionSeconds = 0;
  if (currentSession) {
    isCurrentlyActiveOrPaused = true;
    if (currentSession.status === PointSessionStatus.active) {
      statusText = "\u{1F7E2} Em Servi\xE7o";
    } else if (currentSession.status === PointSessionStatus.paused) {
      statusText = "\u{1F7E1} Pausado";
    }
    const now = Date.now();
    const totalElapsed = Math.floor((now - currentSession.startedAt.getTime()) / 1e3);
    let totalPauseDuration = 0;
    for (const pause of currentSession.pauses) {
      if (pause.endedAt) {
        totalPauseDuration += Math.floor((pause.endedAt.getTime() - pause.startedAt.getTime()) / 1e3);
      } else if (pause.status === "active") {
        totalPauseDuration += Math.floor((now - pause.startedAt.getTime()) / 1e3);
      }
    }
    currentSessionSeconds = Math.max(0, totalElapsed - totalPauseDuration);
    currentSessionTimeText = formatDuration(currentSessionSeconds);
  }
  const weeklyGoalActive = member.weeklyGoalActive ?? guild.settings?.weeklyGoalActive ?? false;
  let weeklyGoalContent = "";
  if (weeklyGoalActive) {
    const now = /* @__PURE__ */ new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    const endOfWeekTimestamp = Math.floor(endOfWeek.getTime() / 1e3);
    const weeklySessions = sessionsList.filter((s) => {
      if (!s.startedAt || !s.endedAt) return false;
      return s.startedAt.getTime() >= startOfWeek.getTime() && s.endedAt.getTime() < endOfWeek.getTime();
    });
    const weeklyGoalSeconds = member.weeklyGoalSeconds || guild.settings?.weeklyGoalSeconds || 0;
    const weeklyAccumulatedSeconds = weeklySessions.reduce((acc, s) => acc + (s.totalSeconds || 0), 0);
    const isCurrentSessionInThisWeek = currentSession && currentSession.startedAt.getTime() >= startOfWeek.getTime();
    const weeklyTotalSeconds = weeklyAccumulatedSeconds + (isCurrentSessionInThisWeek ? currentSessionSeconds : 0);
    const weeklyRemainingSeconds = Math.max(0, weeklyGoalSeconds - weeklyTotalSeconds);
    const weeklyPercentage = weeklyGoalSeconds > 0 ? Math.min(100, weeklyTotalSeconds / weeklyGoalSeconds * 100) : 0;
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
      fraseMotivacional = "Meta conclu\xEDda! Tire um dia de folga.";
    } else if (weeklyPercentage >= 80) {
      fraseMotivacional = "Na reta final! Voc\xEA est\xE1 quase l\xE1!";
    } else if (weeklyPercentage >= 60) {
      fraseMotivacional = "Falta pouco, quase l\xE1!";
    } else if (weeklyPercentage >= 50) {
      fraseMotivacional = "Metade do caminho j\xE1 foi!";
    } else if (weeklyPercentage >= 30) {
      fraseMotivacional = "Quase na metade!";
    } else if (weeklyPercentage >= 0.1) {
      fraseMotivacional = "Continue nesse pique!";
    } else {
      fraseMotivacional = "Que tal come\xE7ar agora?";
    }
    weeklyGoalContent = `### Meta Semanal
- Meta da semana: **${formatDuration(weeklyGoalSeconds)}**
- Tempo atual: **${formatDuration(weeklyTotalSeconds)}**` + (weeklyRemainingSeconds > 0 ? `
- Tempo restante: **${formatDuration(weeklyRemainingSeconds)}**` : "") + `
- Termina <t:${endOfWeekTimestamp}:R>

${barraDeProgresso} **(${weeklyPercentage.toFixed(1)}%)**

> ${fraseMotivacional}`;
  }
  let startButtonState = buttonConfig.Finished;
  if (currentSession) {
    if (currentSession.status === PointSessionStatus.active) {
      startButtonState = buttonConfig.Active;
    } else if (currentSession.status === PointSessionStatus.paused) {
      startButtonState = buttonConfig.Paused;
    }
  }
  const panel2 = new ContainerBuilder().addSectionComponents(
    new SectionBuilder().setThumbnailAccessory(
      new ThumbnailBuilder().setURL(interaction.user.displayAvatarURL())
    ).addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ${icon.work} Ol\xE1, ${interaction.user.globalName || interaction.user.username}!
> - \xDAltima sess\xE3o: ${lastSessionText}
> - Total de sess\xF5es: **${totalSessions}**
> - Tempo total acumulado: **${formatDuration(totalAccumulatedSeconds)}**`
      )
    )
  ).addSeparatorComponents(
    new SeparatorBuilder().setSpacing(2)
  ).addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `### Informa\xE7\xF5es
- Status atual: \` ${statusText} \`` + (isCurrentlyActiveOrPaused ? `
- Tempo da sess\xE3o atual: **${currentSessionTimeText}**` : "") + `
- M\xE9dia di\xE1ria: **${formatDuration(dailyAverageSeconds)}**
- Posi\xE7\xE3o no ranking semanal: **Em breve...**
\u200B`
    )
  ).addActionRowComponents(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(startButtonState.customId).setLabel(startButtonState.label).setEmoji(startButtonState.emoji).setStyle(startButtonState.style),
      new ButtonBuilder().setCustomId("/point/close").setLabel("Encerrar Servi\xE7o").setEmoji(icon.stop.toString()).setStyle(ButtonStyle.Danger).setDisabled(!isCurrentlyActiveOrPaused),
      new ButtonBuilder().setCustomId("/point/refresh").setEmoji(icon.refresh.toString()).setStyle(ButtonStyle.Secondary)
    )
  );
  if (weeklyGoalActive) {
    panel2.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(2)
    ).addTextDisplayComponents(
      new TextDisplayBuilder().setContent(weeklyGoalContent)
    );
  }
  await interaction.editReply({
    components: [panel2],
    flags: ["IsComponentsV2"]
  });
}
createResponder({
  customId: "/point/panel",
  types: [ResponderType.Button],
  async run(interaction) {
    await interaction.deferReply({ flags: ["Ephemeral"] });
    await panel(interaction);
  }
});
createResponder({
  customId: "/point/refresh",
  types: [ResponderType.Button],
  async run(interaction) {
    await interaction.deferUpdate();
    await panel(interaction);
  }
});
export {
  panel
};
