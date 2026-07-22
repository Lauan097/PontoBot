import {
    ApplicationCommandType,
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder
} from "discord.js";
import { prisma } from "#database";
import { createCommand } from "#base";
import { PointSessionStatus } from "#enums";

createCommand({
    name: "status",
    description: "Verifique o status do bot",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const totalMembros = interaction.client.guilds.cache.reduce(
            (acc, guild) => acc + guild.memberCount,
            0
        );

        const activeSessions = await prisma.pointSession.count({
            where: {
                status: PointSessionStatus.active
            }
        })

        await interaction.reply({
            components: [
                new ContainerBuilder().addSectionComponents(
                    new SectionBuilder()
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(
                                    interaction.client.user.displayAvatarURL()
                                )
                                .setDescription("Avatar do Bot")
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
                                "## Status do Bot\u3164\u3164\u3164\n\n" +
                                    `- Ativo <t:${Math.floor((Date.now() - (interaction.client.uptime || 0)) / 1000)}:R>\n` +
                                    `- Latência — **${interaction.client.ws.ping}ms**\n` +
                                    `- Memória — \` ${(process.memoryUsage().heapUsed / 1000000).toFixed(2)}MB \`\n\u200b\n`
                            )
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
                                `- Servidores — **${interaction.client.guilds.cache.size}**\n` +
                                    `- Membros — **${totalMembros}**\n` +
                                    `- Canais — **${interaction.client.channels.cache.size}**\n` +
                                    `- Sessões ativas — **${activeSessions}**\n`
                            )
                        )
                )
            ],
            flags: ["IsComponentsV2", "Ephemeral"]
        });
    }
});
