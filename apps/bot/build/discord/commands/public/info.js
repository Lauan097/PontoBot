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
  ButtonBuilder,
  ButtonStyle
} from "discord.js";
import pkg from "../../../../package.json";
createCommand({
  name: "info",
  description: "Informa\xE7\xF5es sobre o bot",
  type: ApplicationCommandType.ChatInput,
  async run(interaction) {
    const cmds = await interaction.client.application.commands.fetch();
    const config = cmds.find((cmd) => cmd.name === "configurar");
    const status = cmds.find((cmd) => cmd.name === "status");
    const panel = cmds.find((cmd) => cmd.name === "painel");
    const info = cmds.find((cmd) => cmd.name === "info");
    const svCount = interaction.client.guilds.cache.size;
    const c = [
      new ContainerBuilder().addSectionComponents(
        new SectionBuilder().setThumbnailAccessory(
          new ThumbnailBuilder().setURL(interaction.client.user.displayAvatarURL())
        ).addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# Informa\xE7\xF5es \u2014 PontoBot
- Vers\xE3o: **v${pkg.version}**
- Servidores: **${svCount}**
- Em servi\xE7o desde **12/07/2026**
`
          )
        )
      ).addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
      ).addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `### Comandos
- </configurar:${config?.id}> \u2014 Use para configurar logs e meta semanal.
- </status:${status?.id}> \u2014 Veja informa\xE7\xF5es sobre o sistema.
- </painel:${panel?.id}> \u2014 Envie o painel de bate ponto a um canal espec\xEDfico.
- </info:${info?.id}> \u2014 Veja informa\xE7\xF5es sobre o bot.`
        )
      ).addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
      ).addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setLabel("Termos").setURL("https://discord.com").setDisabled(true).setStyle(ButtonStyle.Link),
          new ButtonBuilder().setLabel("Privacidade").setURL("https://discord.com").setDisabled(true).setStyle(ButtonStyle.Link),
          new ButtonBuilder().setLabel("Suporte").setURL("https://discord.gg/encgSrYuHd").setStyle(ButtonStyle.Link)
        )
      )
    ];
    await interaction.reply({
      components: c,
      flags: ["IsComponentsV2", "Ephemeral"]
    });
  }
});
