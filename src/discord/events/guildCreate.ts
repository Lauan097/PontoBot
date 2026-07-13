import { createEvent } from "#base";
import { prisma } from "#database";

createEvent({
    name: "New Guild",
    event: "guildCreate",
    async run(guild) {
        await prisma.guild
            .upsert({
                where: { discordId: guild.id },
                update: {
                    icon: guild.iconURL() ?? undefined,
                    name: guild.name,
                    ownerDiscordId: guild.ownerId,
                    active: true
                },
                create: {
                    discordId: guild.id,
                    name: guild.name,
                    icon: guild.iconURL() ?? undefined,
                    ownerDiscordId: guild.ownerId
                }
            })
            .catch((error) => {
                console.error("[GUILD CREATE]", error);
                return null;
            });

        console.log("New server: " + guild.name + " | " + guild.id);
    }
});
