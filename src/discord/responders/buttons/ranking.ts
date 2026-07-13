import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { Colors } from "discord.js";

createResponder({
    customId: "/point/ranking/weekly",
    types: [ResponderType.Button],
    async run(interaction) {
        await interaction.reply({
            embeds: [{
                description: "O ranking semanal estará disponível em breve...",
                color: Colors.Green
            }],
            flags: ["Ephemeral"]
        });
    }
});

createResponder({
    customId: "/point/ranking/all",
    types: [ResponderType.Button],
    async run(interaction) {
        await interaction.reply({
            embeds: [{
                description: "O ranking global estará disponível em breve...",
                color: Colors.Green
            }],
            flags: ["Ephemeral"]
        });
    }
});