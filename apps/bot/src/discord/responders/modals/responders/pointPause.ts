import { createResponder } from "#base";
import { prisma } from "#database";
import { PauseStatus, PointSessionStatus } from "#enums";
import { ResponderType } from "@constatic/base";
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
                    embeds: [
                        {
                            description: "Você não está registrado no sistema.",
                            color: Colors.Red
                        }
                    ],
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
                    embeds: [
                        {
                            description: "Você não tem nenhuma sessão ativa.",
                            color: Colors.Red
                        }
                    ],
                    flags: ["Ephemeral"]
                });
                return;
            }

            if (session.pauses.length >= 5) {
                await interaction.followUp({
                    embeds: [
                        {
                            description:
                                "Você atingiu o limite de 5 pausas para esta sessão de ponto.",
                            color: Colors.Red
                        }
                    ],
                    flags: ["Ephemeral"]
                });
                return;
            }

            await prisma.$transaction([
                prisma.pause.create({
                    data: {
                        pointSessionId: session.id,
                        status: PauseStatus.active,
                        startedAt: new Date(),
                        reason: reason
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
                embeds: [
                    {
                        description: "Ocorreu um erro ao pausar sua sessão.",
                        color: Colors.Red
                    }
                ],
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
                    embeds: [
                        {
                            description: "Você não está registrado no sistema.",
                            color: Colors.Red
                        }
                    ],
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
                    embeds: [
                        {
                            description: "Você não tem nenhuma sessão pausada.",
                            color: Colors.Red
                        }
                    ],
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

            const now = new Date();

            if (activePause) {
                const durationSeconds = Math.max(
                    0,
                    Math.floor(
                        (now.getTime() - activePause.startedAt.getTime()) / 1000
                    )
                );
                await prisma.$transaction([
                    prisma.pause.update({
                        where: { id: activePause.id },
                        data: {
                            status: PauseStatus.finished,
                            endedAt: now,
                            durationSeconds: durationSeconds
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
                embeds: [
                    {
                        description: "Ocorreu um erro ao retomar sua sessão.",
                        color: Colors.Red
                    }
                ],
                flags: ["Ephemeral"]
            });
        }
    }
});
