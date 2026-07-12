import { createCommand, createResponder } from "#base";
import { getOrCreateGuildMember, icon, setAudit } from "#functions";
import { ResponderType } from "@constatic/base";
import {
    ApplicationCommandType,
    ChannelSelectMenuBuilder,
    ChannelType,
    Colors,
    LabelBuilder,
    ModalBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder, 
    TextDisplayBuilder
} from "discord.js";
import { prisma } from "#database";

createCommand({
    name: "configurar",
    description: "Configura definições e preferências do sistema no servidor.",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: ["Administrator"],
    async run(interaction) {
        if (!interaction.guildId) {
            await interaction.reply({
                embeds: [{
                    description: "Este comando só pode ser usado dentro de um servidor."
                }],
                flags: ["Ephemeral"]
            });
            return;
        }

        const result = await getOrCreateGuildMember(interaction, interaction.guildId, interaction.user.id);

        if (!result.success) {
            await interaction.reply({ 
                embeds: [{
                    description: result.reason
                }],
                flags: ["Ephemeral"]
            });
            return;
        }

        const { guild } = result;
        const settings = guild.settings;

        const currentGoalSeconds = settings?.weeklyGoalSeconds;
        const weeklyGoalValue = currentGoalSeconds !== null && currentGoalSeconds !== undefined ? String(currentGoalSeconds) : "null";

        const goals = [
            { label: "Sem meta semanal", value: "null", description: "Nenhuma meta será definida.", emoji: icon.cancel.toString() },
            { label: "1 horas semanais", value: "3600", description: "A meta será de 1 hora total a ser cumprida pelos membros.", emoji: icon.clock.toString() },
            { label: "2 horas semanais", value: "7200", description: "A meta será de 2 horas totais a serem cumpridas pelos membros.", emoji: icon.clock.toString() },
            { label: "3 horas semanais", value: "10800", description: "A meta será de 3 horas totais a serem cumpridas pelos membros.", emoji: icon.clock.toString() },
            { label: "4 horas semanais", value: "14400", description: "A meta será de 4 horas totais a serem cumpridas pelos membros.", emoji: icon.clock.toString() },
            { label: "5 horas semanais", value: "18000", description: "A meta será de 5 horas totais a serem cumpridas pelos membros.", emoji: icon.clock.toString() },
            { label: "6 horas semanais", value: "21600", description: "A meta será de 6 horas totais a serem cumpridas pelos membros.", emoji: icon.clock.toString() },
            { label: "7 horas semanais", value: "25200", description: "A meta será de 7 horas totais a serem cumpridas pelos membros.", emoji: icon.clock.toString() },
            { label: "8 horas semanais", value: "28800", description: "A meta será de 8 horas totais a serem cumpridas pelos membros.", emoji: icon.clock.toString() },
            { label: "9 horas semanais", value: "32400", description: "A meta será de 9 horas totais a serem cumpridas pelos membros.", emoji: icon.clock.toString() },
            { label: "10 horas semanais", value: "36000", description: "A meta será de 10 horas totais a serem cumpridas pelos membros.", emoji: icon.clock.toString() }
        ];

        const selectMenuOptions = goals.map(goal => 
            new StringSelectMenuOptionBuilder()
            .setLabel(goal.label)
            .setValue(goal.value)
            .setEmoji(goal.emoji)
            .setDescription(goal.description)
            .setDefault(weeklyGoalValue === goal.value)
        );

        const pointOpenLogMenu = new ChannelSelectMenuBuilder()
            .setCustomId("pointopenlog")
            .setPlaceholder("Selecione ou busque pelo nome...")
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildText);

        if (settings?.pointOpenLogChannelId) {
            pointOpenLogMenu.setDefaultChannels(settings.pointOpenLogChannelId);
        }

        const pointCloseLogMenu = new ChannelSelectMenuBuilder()
            .setCustomId("pointcloselog")
            .setPlaceholder("Selecione ou busque pelo nome...")
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildText);

        if (settings?.pointCloseLogChannelId) {
            pointCloseLogMenu.setDefaultChannels(settings.pointCloseLogChannelId);
        }

        await interaction.showModal(
            new ModalBuilder()
            .setTitle("Configurações")
            .setCustomId("/config/modal")
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    "-# Em breve essa opção será movida para o nosso dashboard web."
                )
            )
            .addLabelComponents(
                new LabelBuilder()
                .setLabel("Meta da semana")
                .setDescription("Defina o tempo para a meta da semana")
                .setStringSelectMenuComponent(
                    new StringSelectMenuBuilder()
                    .setCustomId("weeklygoal")
                    .setPlaceholder("Selecione um valor...")
                    .setRequired(true)
                    .addOptions(selectMenuOptions)
                )
            )
            .addLabelComponents(
                new LabelBuilder()
                .setLabel("Abertura de expedientes")
                .setDescription("Selecione um canal para onde as mensagens de início de expedientes serão enviadas.")
                .setChannelSelectMenuComponent(pointOpenLogMenu)
            )
            .addLabelComponents(
                new LabelBuilder()
                .setLabel("Encerramento de expedientes")
                .setDescription("Selecione um canal para onde as mensagens de encerramento de expedientes serão enviadas.")
                .setChannelSelectMenuComponent(pointCloseLogMenu)
            )
        );
    }
});

createResponder({
    customId: "/config/modal",
    types: [ResponderType.Modal],
    async run(interaction) {
        const weeklyGoal = interaction.fields.getStringSelectValues("weeklygoal");
        const pointOpenLog = interaction.fields.getSelectedChannels("pointopenlog");
        const pointCloseLog = interaction.fields.getSelectedChannels("pointcloselog");

        if (!interaction.inGuild()) {
            await interaction.reply({
                embeds: [{
                    description: "Este comando só pode ser usado dentro de um servidor."
                }],
                flags: ["Ephemeral"]
            });
            return;
        }

        await interaction.deferReply({ flags: ["Ephemeral"] });
        
        try {
            const result = await getOrCreateGuildMember(interaction, interaction.guildId, interaction.user.id);

            if (!result.success) {
                await interaction.editReply({ 
                    embeds: [{
                        description: result.reason,
                        color: Colors.Red
                    }]
                });
                return;
            }

            const { guild } = result;

            const weeklyGoalRaw = weeklyGoal[0];
            const weeklyGoalSeconds = weeklyGoalRaw && weeklyGoalRaw !== "null" ? Number(weeklyGoalRaw) : null;
            const weeklyGoalActive = weeklyGoalSeconds !== null;

            const pointOpenLogChannelId = pointOpenLog?.first()?.id ?? null;
            const pointCloseLogChannelId = pointCloseLog?.first()?.id ?? null;

            const oldActive = guild.settings?.weeklyGoalActive ?? false;
            const oldSeconds = guild.settings?.weeklyGoalSeconds ?? null;
            const oldOpenLog = guild.settings?.pointOpenLogChannelId ?? null;
            const oldCloseLog = guild.settings?.pointCloseLogChannelId ?? null;

            await prisma.settings.upsert({
                where: { guildId: guild.id },
                update: {
                    weeklyGoalActive,
                    weeklyGoalSeconds,
                    pointOpenLogChannelId,
                    pointCloseLogChannelId,
                },
                create: {
                    guildId: guild.id,
                    weeklyGoalActive,
                    weeklyGoalSeconds,
                    pointOpenLogChannelId,
                    pointCloseLogChannelId,
                }
            });

            if (weeklyGoalActive !== oldActive) {
                await setAudit({
                    guildId: guild.id,
                    userId: interaction.user.id,
                    action: "update_global_weekly_goal_status",
                    oldValue: oldActive,
                    newValue: weeklyGoalActive
                });
            }

            if (weeklyGoalSeconds !== oldSeconds) {
                await setAudit({
                    guildId: guild.id,
                    userId: interaction.user.id,
                    action: "update_global_weekly_goal_duration",
                    oldValue: oldSeconds,
                    newValue: weeklyGoalSeconds
                });
            }

            if (pointOpenLogChannelId !== oldOpenLog) {
                await setAudit({
                    guildId: guild.id,
                    userId: interaction.user.id,
                    action: "update_point_open_log_channel_id",
                    oldValue: oldOpenLog,
                    newValue: pointOpenLogChannelId
                });
            }

            if (pointCloseLogChannelId !== oldCloseLog) {
                await setAudit({
                    guildId: guild.id,
                    userId: interaction.user.id,
                    action: "update_point_close_log_channel_id",
                    oldValue: oldCloseLog,
                    newValue: pointCloseLogChannelId
                });
            }

            await interaction.editReply({
                embeds: [{
                    description: `${icon.check} As configurações do servidor foram salvas com sucesso!`,
                    color: Colors.Green
                }]
            });

        } catch (e) {
            console.error("[CONFIG] Erro ao configurar:", e);
            await interaction.editReply({
                embeds: [{
                    description: "Ocorreu um erro ao salvar as configurações. Tente novamente mais tarde.",
                    color: Colors.Red
                }]
            });
        }
    }
});