import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { LabelBuilder, ModalBuilder, UserSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

createResponder({
    customId: "/point/open",
    types: [ResponderType.Button],
    async run(interaction) {
        
        await interaction.showModal(
            new ModalBuilder()
            .setCustomId("/point/open/modal")
            .setTitle("Iniciar Serviço")
            .addLabelComponents(
                new LabelBuilder()
                .setLabel("Participantes")
                .setDescription("Selecione os participantes iniciais do serviço. Não precisa incluir você!")
                .setUserSelectMenuComponent(
                    new UserSelectMenuBuilder()
                    .setCustomId("participants")
                    .setPlaceholder("Busque pelo nome do membro... (max 10)")
                    .setMaxValues(10)
                    .setRequired(false)
                )
            )
            .addLabelComponents(
                new LabelBuilder()
                .setLabel("Anotações")
                .setDescription("Use se quiser adicionar alguma observação.")
                .setTextInputComponent(
                    new TextInputBuilder()
                    .setCustomId("anotations")
                    .setPlaceholder("Digite algo aqui... (max 1000 chars)")
                    .setMaxLength(1000)
                    .setRequired(false)
                    .setStyle(TextInputStyle.Paragraph)
                )
            )
        )
        
    }
})

createResponder({
    customId: "/point/pause",
    types: [ResponderType.Button],
    async run(interaction) {

        await interaction.showModal(
            new ModalBuilder()
            .setCustomId("/point/pause/modal")
            .setTitle("Pausar Serviço")
            .addLabelComponents(
                new LabelBuilder()
                .setLabel("Motivo")
                .setDescription("Informe o motivo da pausa.")
                .setTextInputComponent(
                    new TextInputBuilder()
                    .setCustomId("reason")
                    .setPlaceholder("Digite o motivo da pausa... (max 400 chars)")
                    .setMaxLength(400)
                    .setRequired(true)
                    .setStyle(TextInputStyle.Paragraph)
                )
            )
        )
        
    }
})

createResponder({
    customId: "/point/close",
    types: [ResponderType.Button],
    async run(interaction) {

        await interaction.showModal(
            new ModalBuilder()
            .setCustomId("/point/close/modal")
            .setTitle("Encerrar Serviço")
            .addLabelComponents(
                new LabelBuilder()
                .setLabel("Participantes adicionais")
                .setDescription("Alguém entrou no meio do serviço?")
                .setUserSelectMenuComponent(
                    new UserSelectMenuBuilder()
                    .setCustomId("participants")
                    .setPlaceholder("Busque pelo nome do membro... (max 10)")
                    .setMaxValues(10)
                    .setRequired(false)
                )
            )
            .addLabelComponents(
                new LabelBuilder()
                .setLabel("Relatório Final")
                .setDescription("O que ocorreu durante o serviço?")
                .setTextInputComponent(
                    new TextInputBuilder()
                    .setCustomId("report")
                    .setPlaceholder("Digite o relatório final... (max 1000 chars)")
                    .setMaxLength(1000)
                    .setRequired(false)
                    .setStyle(TextInputStyle.Paragraph)
                )
            )
        )
        
    },
})