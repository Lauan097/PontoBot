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
            description: "Este comando s\xF3 pode ser usado dentro de um servidor.",
            color: Colors.Red
          }],
          flags: ["Ephemeral"]
        });
        return;
      }
      const finalParticipants = (interaction?.fields?.getSelectedUsers("participants")?.map((user) => user.id) || []).filter((id) => id !== interaction.user.id);
      const report = interaction.fields.getTextInputValue("report") || "Nenhum relat\xF3rio final";
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
      const { guild, member } = result;
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
            description: "Voc\xEA n\xE3o tem nenhuma sess\xE3o ativa ou pausada.",
            color: Colors.Red
          }],
          flags: ["Ephemeral"]
        });
        return;
      }
      const now = /* @__PURE__ */ new Date();
      const grossSeconds = Math.max(0, Math.floor((now.getTime() - session.startedAt.getTime()) / 1e3));
      const activePause = session.pauses.find((p) => p.status === PauseStatus.active);
      let activePauseDuration = 0;
      if (activePause) {
        activePauseDuration = Math.max(0, Math.floor((now.getTime() - activePause.startedAt.getTime()) / 1e3));
      }
      let totalPauseSeconds = 0;
      for (const pause of session.pauses) {
        if (pause.endedAt) {
          totalPauseSeconds += Math.floor((pause.endedAt.getTime() - pause.startedAt.getTime()) / 1e3);
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
      let pausesText = `- **N\xFAmero de Pausas:** ${session.pauses.length}`;
      if (session.pauses.length > 0) {
        pausesText += "\n" + session.pauses.map((p, index) => {
          const startT = Math.floor(p.startedAt.getTime() / 1e3);
          const end = p.endedAt || now;
          const endT = Math.floor(end.getTime() / 1e3);
          const duration = p.durationSeconds || Math.floor((end.getTime() - p.startedAt.getTime()) / 1e3);
          return `  - **${index + 1}\xB0 Pausa** \u2014 das <t:${startT}:t> at\xE9 <t:${endT}:t> (Dura\xE7\xE3o: **${formatDuration(duration)}**)`;
        }).join("\n");
      }
      let mCloseUrl = "https://discord.com";
      const channelId = guild.settings?.pointCloseLogChannelId;
      if (channelId) {
        const ch = await interaction.client.channels.fetch(channelId).catch(() => null);
        if (ch && ch.type === ChannelType.GuildText) {
          const m = await ch.send({
            components: [
              new ContainerBuilder().setAccentColor(Colors.Red).addSectionComponents(
                new SectionBuilder().setThumbnailAccessory(
                  new ThumbnailBuilder().setURL(interaction.user.displayAvatarURL())
                ).addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    `## ${icon.logout} Expediente Encerrado
- Fechado por <@${interaction.user.id}>
- In\xEDcio: <t:${Math.floor(session.startedAt.getTime() / 1e3)}:f>
- T\xE9rmino: <t:${Math.floor(now.getTime() / 1e3)}:f>`
                  )
                )
              ).addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
              ).addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `### Informa\xE7\xF5es
- Dura\xE7\xE3o Bruta \u2014 **${formatDuration(grossSeconds)}**
- Dura\xE7\xE3o L\xEDquida \u2014 **${formatDuration(netSeconds)}**

` + pausesText
                )
              ).addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
              ).addSectionComponents(
                new SectionBuilder().setButtonAccessory(
                  new ButtonBuilder().setLabel("Log Inicial").setStyle(ButtonStyle.Link).setURL(session.messageOpenLink || "https://discord.com")
                ).addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    `- **Participantes Iniciais:** ${session.initialParticipantsIds.length > 0 ? `
  - ${session.initialParticipantsIds.map((id) => `<@${id}>`).join("\n  - ")}` : "Nenhum"}

- **Participantes Adicionais:** ${finalParticipants.length > 0 ? `
  - ${finalParticipants.map((id) => `<@${id}>`).join("\n  - ")}` : "Nenhum"}`
                  )
                )
              ).addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
              ).addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `### Relat\xF3rio Final:
${report}`
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
            }).catch((e) => console.error("[POINT CLOSE MODAL] Erro ao atualizar link da mensagem:", e.stack || e));
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
              new ContainerBuilder().setAccentColor(Colors.Green).addSectionComponents(
                new SectionBuilder().setThumbnailAccessory(
                  new ThumbnailBuilder().setURL(interaction.user.displayAvatarURL())
                ).addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    `## ${icon.login} Expediente Iniciado
- Aberto por <@${member.discordId}>
- Iniciado <t:${Math.floor(session.startedAt.getTime() / 1e3)}:R>
- Finalizado <t:${Math.floor(now.getTime() / 1e3)}:R>`
                  )
                )
              ).addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
              ).addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `### Informa\xE7\xF5es
- Canal de voz \u2014 ${voiceCh && voiceCh !== "Nenhum" ? `<#${voiceCh}>` : "**Nenhum**"}
- Atividade \u2014 **${activity}**

- **Participantes:** ${initialParticipants.length > 0 ? `
  - ${initialParticipants.map((id) => `<@${id}>`).join("\n  - ")}` : "Nenhum"}`
                )
              ).addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
              ).addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `- **Anota\xE7\xF5es iniciais**
${initialNotes}`
                )
              ).addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
              ).addSectionComponents(
                new SectionBuilder().setButtonAccessory(
                  new ButtonBuilder().setLabel("Log Final").setStyle(ButtonStyle.Link).setURL(mCloseUrl)
                ).addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`> ${icon.check} Expediente finalizado`)
                )
              )
            ];
            await openMessage.edit({
              components: updatedOpenMessageComponents,
              flags: ["IsComponentsV2"]
            }).catch((err) => console.error("[POINT CLOSE MODAL] Erro ao editar mensagem de in\xEDcio:", err));
          }
        }
      }
      await panel(interaction);
    } catch (e) {
      console.error("[POINT CLOSE]", e);
      await interaction.followUp({
        embeds: [{
          description: "Ocorreu um erro ao encerrar sua sess\xE3o.",
          color: Colors.Red
        }],
        flags: ["Ephemeral"]
      });
    }
  }
});
