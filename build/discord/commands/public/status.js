import { createCommand } from "#base";
import {
  ApplicationCommandType,
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder
} from "discord.js";
createCommand({
  name: "status",
  description: "Verifique o status do bot",
  type: ApplicationCommandType.ChatInput,
  async run(interaction) {
    const totalMembros = interaction.client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount,
      0
    );
    await interaction.reply({
      components: [
        new ContainerBuilder().addSectionComponents(
          new SectionBuilder().setThumbnailAccessory(
            new ThumbnailBuilder().setURL(
              interaction.client.user.displayAvatarURL()
            ).setDescription("Avatar do Bot")
          ).addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## Status do Bot\u3164\u3164\u3164

- Ativo <t:${Math.floor((Date.now() - (interaction.client.uptime || 0)) / 1e3)}:R>
- Lat\xEAncia \u2014 **${interaction.client.ws.ping}ms**
- Mem\xF3ria \u2014 \` ${(process.memoryUsage().heapUsed / 1e6).toFixed(2)}MB \`
\u200B
`
            )
          ).addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `- Servidores \u2014 **${interaction.client.guilds.cache.size}**
- Membros \u2014 **${totalMembros}**
- Canais \u2014 **${interaction.client.channels.cache.size}**
`
            )
          )
        )
      ],
      flags: ["IsComponentsV2", "Ephemeral"]
    });
  }
});
