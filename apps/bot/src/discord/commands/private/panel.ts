import { createCommand } from "#base";
import { prisma } from "#database";
import { criarImagemPainel, icon } from "#functions";
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ButtonBuilder,
    ButtonStyle,
    Colors,
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageActionRowComponentBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    type MessageCreateOptions
} from "discord.js";

createCommand({
    name: "painel",
    description:
        "Use para enviar o painel de bate ponto no canal selecionado.",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: ["Administrator"],
    options: [
        {
            name: "canal",
            description:
                "Selecione o canal onde deseja que o painel seja enviado.",
            type: ApplicationCommandOptionType.Channel,
            required: true
        },
        {
            name: "template",
            description:
                "Escolha um template pré-definido por você via dashboard.",
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: true
        }
    ],
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused();
        const choices = [];

        if (
            !focused ||
            "padrão".includes(focused.toLowerCase()) ||
            "default".includes(focused.toLowerCase())
        ) {
            choices.push({ name: "Template Padrão", value: "default" });
        }

        if (interaction.guildId) {
            try {
                const templates = await prisma.template.findMany({
                    where: {
                        guild: {
                            discordId: interaction.guildId
                        },
                        name: {
                            contains: focused,
                            mode: "insensitive"
                        }
                    },
                    take: 25
                });

                for (const template of templates) {
                    choices.push({
                        name: template.name,
                        value: template.id
                    });
                }
            } catch (error) {
                console.error(
                    "Erro ao buscar templates no autocomplete:",
                    error
                );
            }
        }

        return choices.slice(0, 25);
    },
    async run(interaction) {
        const { options } = interaction;

        const channel = options.getChannel("canal", true);
        const templateId = options.getString("template", true);

        if (!channel.isTextBased()) {
            await interaction.reply({
                embeds: [
                    {
                        description:
                            "O canal selecionado precisa ser um canal de texto.",
                        color: Colors.Red
                    }
                ],
                flags: ["Ephemeral"]
            });
            return;
        }

        await interaction.deferReply({ flags: ["Ephemeral"] });

        let components: MessageCreateOptions["components"];
        const attachment = interaction.guild
            ? await criarImagemPainel(interaction.guild)
            : null;

        if (templateId === "default") {
            const bannerUrl = attachment
                ? "attachment://painel-servidor.png"
                : "https://i.imgur.com/yKUJyTb.png";

            components = [
                new ContainerBuilder()
                    .addMediaGalleryComponents(
                        new MediaGalleryBuilder().addItems(
                            new MediaGalleryItemBuilder().setURL(bannerUrl)
                        )
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(
                            SeparatorSpacingSize.Large
                        )
                    )
                    .addActionRowComponents(
                        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                            new ButtonBuilder()
                                .setCustomId("/point/panel")
                                .setLabel("Painel de Serviço")
                                .setEmoji(icon.work.toString())
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId("/point/ranking/weekly")
                                .setLabel("Ranking Semanal\u200b \u200b")
                                .setEmoji(icon.calendar.toString())
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId("/point/ranking/all")
                                .setLabel("Ranking Global\u200b \u200b")
                                .setEmoji(icon.medals.toString())
                                .setStyle(ButtonStyle.Secondary)
                        )
                    )
            ];
        } else {
            const dbTemplate = await prisma.template.findUnique({
                where: { id: templateId }
            });

            if (!dbTemplate) {
                await interaction.editReply({
                    embeds: [
                        {
                            description:
                                "O template selecionado não foi encontrado no banco de dados.",
                            color: Colors.Red
                        }
                    ]
                });
                return;
            }

            components =
                dbTemplate.content as unknown as MessageCreateOptions["components"];
        }

        try {
            await channel.send({
                files: attachment ? [attachment] : [],
                components,
                flags: ["IsComponentsV2"]
            });

            await interaction.editReply({
                embeds: [
                    {
                        description: `Painel de ponto enviado com sucesso em ${channel}`,
                        color: Colors.Green
                    }
                ]
            });
        } catch (error) {
            console.error("Erro ao enviar painel de ponto:", error);
            await interaction.editReply({
                embeds: [
                    {
                        description:
                            "Ocorreu um erro ao tentar enviar o painel.\n\nVerifique se o bot tem permissão para ver e enviar mensagens neste canal.",
                        color: Colors.Red
                    }
                ]
            });
        }
    }
});
