import { createCommand } from "#base";
import { 
    ApplicationCommandType, 
    ContainerBuilder,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    ThumbnailBuilder,
    ActionRowBuilder,
    MessageActionRowComponentBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import { readFile } from "node:fs/promises";

const pkg = JSON.parse(
    await readFile(new URL("../../../../package.json", import.meta.url), "utf8")
);

createCommand({
    name: "info",
    description: "Informações sobre o bot",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const cmds = await interaction.client.application.commands.fetch();

        const config = cmds.find(cmd => cmd.name === "configurar");
        const status = cmds.find(cmd => cmd.name === "status");
        const panel = cmds.find(cmd => cmd.name === "painel");
        const info = cmds.find(cmd => cmd.name === "info");

        const svCount = interaction.client.guilds.cache.size;
        
        const c = [
            new ContainerBuilder()
            .addSectionComponents(
                new SectionBuilder()
                .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(interaction.client.user.displayAvatarURL())
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        "# Informações — PontoBot\n" +
                        `- Versão: **v${pkg.version}**\n` +
                        `- Servidores: **${svCount}**\n` +
                        `- Em serviço desde **12/07/2026**\n`
                    )
                )
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    "### Comandos\n" +
                    `- </configurar:${config?.id}> — Use para configurar logs e meta semanal.\n` +
                    `- </status:${status?.id}> — Veja informações sobre o sistema.\n` +
                    `- </painel:${panel?.id}> — Envie o painel de bate ponto a um canal específico.\n` +
                    `- </info:${info?.id}> — Veja informações sobre o bot.\n\n` +
                    "### En breve...\n" +
                    "- Dashboard web para gerenciamento e métricas\n"
                )
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
            )
            .addActionRowComponents(
                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                    new ButtonBuilder()
                    .setLabel("Termos")
                    .setURL("https://discord.com")
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Link),
                    new ButtonBuilder()
                    .setLabel("Privacidade")
                    .setURL("https://discord.com")
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Link),
                    new ButtonBuilder()
                    .setLabel("Servidor de Suporte")
                    .setURL("https://discord.gg/encgSrYuHd")
                    .setStyle(ButtonStyle.Link),
                )
            )
        ]

        await interaction.reply({
            components: c,
            flags: ["IsComponentsV2", "Ephemeral"]
        })
    }
});
