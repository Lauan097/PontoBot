import { createEvent } from "#base";
import { prisma } from "#database";

createEvent({
    name: "Guild Removed",
    event: "guildDelete",
    async run(guild) {
        await prisma.guild
            .update({
                where: {
                    discordId: guild.id
                },
                data: {
                    active: false
                }
            })
            .catch((error) => {
                console.error("[GUILD DELETE]", error);
            });
    }
});
