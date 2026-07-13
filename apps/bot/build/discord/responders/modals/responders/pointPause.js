import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { prisma } from "#database";
import { PointSessionStatus, PauseStatus } from "#enums";
import { Colors } from "discord.js";
import { panel } from "../../buttons/panel.js";
createResponder({
  customId: "/point/pause/modal",
  types: [ResponderType.ModalComponent],
  async run(interaction) {
    await interaction.deferUpdate();
    try {
      const reason = interaction.fields.getTextInputValue("reason");
      const member = await prisma.member.findFirst({
        where: {
          discordId: interaction.user.id
        }
      });
      if (!member) {
        await interaction.followUp({
          embeds: [{
            description: "Voc\xEA n\xE3o est\xE1 registrado no sistema.",
            color: Colors.Red
          }],
          flags: ["Ephemeral"]
        });
        return;
      }
      const session = await prisma.pointSession.findFirst({
        where: {
          memberId: member.id,
          status: PointSessionStatus.active
        },
        include: {
          pauses: true
        }
      });
      if (!session) {
        await interaction.followUp({
          embeds: [{
            description: "Voc\xEA n\xE3o tem nenhuma sess\xE3o ativa.",
            color: Colors.Red
          }],
          flags: ["Ephemeral"]
        });
        return;
      }
      if (session.pauses.length >= 5) {
        await interaction.followUp({
          embeds: [{
            description: "Voc\xEA atingiu o limite de 5 pausas para esta sess\xE3o de ponto.",
            color: Colors.Red
          }],
          flags: ["Ephemeral"]
        });
        return;
      }
      await prisma.$transaction([
        prisma.pause.create({
          data: {
            pointSessionId: session.id,
            status: PauseStatus.active,
            startedAt: /* @__PURE__ */ new Date(),
            reason
          }
        }),
        prisma.pointSession.update({
          where: { id: session.id },
          data: {
            status: PointSessionStatus.paused
          }
        })
      ]);
      await panel(interaction);
    } catch (e) {
      console.error("[POINT PAUSE]", e);
      await interaction.followUp({
        embeds: [{
          description: "Ocorreu um erro ao pausar sua sess\xE3o.",
          color: Colors.Red
        }],
        flags: ["Ephemeral"]
      });
    }
  }
});
createResponder({
  customId: "/point/resume",
  types: [ResponderType.Button],
  async run(interaction) {
    await interaction.deferUpdate();
    try {
      const member = await prisma.member.findFirst({
        where: {
          discordId: interaction.user.id
        }
      });
      if (!member) {
        await interaction.followUp({
          embeds: [{
            description: "Voc\xEA n\xE3o est\xE1 registrado no sistema.",
            color: Colors.Red
          }],
          flags: ["Ephemeral"]
        });
        return;
      }
      const session = await prisma.pointSession.findFirst({
        where: {
          memberId: member.id,
          status: PointSessionStatus.paused
        }
      });
      if (!session) {
        await interaction.followUp({
          embeds: [{
            description: "Voc\xEA n\xE3o tem nenhuma sess\xE3o pausada.",
            color: Colors.Red
          }],
          flags: ["Ephemeral"]
        });
        return;
      }
      const activePause = await prisma.pause.findFirst({
        where: {
          pointSessionId: session.id,
          status: PauseStatus.active
        }
      });
      const now = /* @__PURE__ */ new Date();
      if (activePause) {
        const durationSeconds = Math.max(0, Math.floor((now.getTime() - activePause.startedAt.getTime()) / 1e3));
        await prisma.$transaction([
          prisma.pause.update({
            where: { id: activePause.id },
            data: {
              status: PauseStatus.finished,
              endedAt: now,
              durationSeconds
            }
          }),
          prisma.pointSession.update({
            where: { id: session.id },
            data: {
              status: PointSessionStatus.active
            }
          })
        ]);
      } else {
        await prisma.pointSession.update({
          where: { id: session.id },
          data: {
            status: PointSessionStatus.active
          }
        });
      }
      await panel(interaction);
    } catch (e) {
      console.error("[POINT RESUME]", e);
      await interaction.followUp({
        embeds: [{
          description: "Ocorreu um erro ao retomar sua sess\xE3o.",
          color: Colors.Red
        }],
        flags: ["Ephemeral"]
      });
    }
  }
});
