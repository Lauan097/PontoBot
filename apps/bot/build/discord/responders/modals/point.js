import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { LabelBuilder, ModalBuilder, UserSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
createResponder({
  customId: "/point/open",
  types: [ResponderType.Button],
  async run(interaction) {
    await interaction.showModal(
      new ModalBuilder().setCustomId("/point/open/modal").setTitle("Iniciar Servi\xE7o").addLabelComponents(
        new LabelBuilder().setLabel("Participantes").setDescription("Selecione os participantes iniciais do servi\xE7o. N\xE3o precisa incluir voc\xEA!").setUserSelectMenuComponent(
          new UserSelectMenuBuilder().setCustomId("participants").setPlaceholder("Busque pelo nome do membro... (max 10)").setMaxValues(10).setRequired(false)
        )
      ).addLabelComponents(
        new LabelBuilder().setLabel("Anota\xE7\xF5es").setDescription("Use se quiser adicionar alguma observa\xE7\xE3o.").setTextInputComponent(
          new TextInputBuilder().setCustomId("anotations").setPlaceholder("Digite algo aqui... (max 1000 chars)").setMaxLength(1e3).setRequired(false).setStyle(TextInputStyle.Paragraph)
        )
      )
    );
  }
});
createResponder({
  customId: "/point/pause",
  types: [ResponderType.Button],
  async run(interaction) {
    await interaction.showModal(
      new ModalBuilder().setCustomId("/point/pause/modal").setTitle("Pausar Servi\xE7o").addLabelComponents(
        new LabelBuilder().setLabel("Motivo").setDescription("Informe o motivo da pausa.").setTextInputComponent(
          new TextInputBuilder().setCustomId("reason").setPlaceholder("Digite o motivo da pausa... (max 400 chars)").setMaxLength(400).setRequired(true).setStyle(TextInputStyle.Paragraph)
        )
      )
    );
  }
});
createResponder({
  customId: "/point/close",
  types: [ResponderType.Button],
  async run(interaction) {
    await interaction.showModal(
      new ModalBuilder().setCustomId("/point/close/modal").setTitle("Encerrar Servi\xE7o").addLabelComponents(
        new LabelBuilder().setLabel("Participantes adicionais").setDescription("Algu\xE9m entrou no meio do servi\xE7o?").setUserSelectMenuComponent(
          new UserSelectMenuBuilder().setCustomId("participants").setPlaceholder("Busque pelo nome do membro... (max 10)").setMaxValues(10).setRequired(false)
        )
      ).addLabelComponents(
        new LabelBuilder().setLabel("Relat\xF3rio Final").setDescription("O que ocorreu durante o servi\xE7o?").setTextInputComponent(
          new TextInputBuilder().setCustomId("report").setPlaceholder("Digite o relat\xF3rio final... (max 1000 chars)").setMaxLength(1e3).setRequired(false).setStyle(TextInputStyle.Paragraph)
        )
      )
    );
  }
});
