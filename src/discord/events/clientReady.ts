import { createEvent } from "#base";
import { env } from "#env";

createEvent({
    name: "Conected Client Discord",
    event: "ready",
    async run(client) {
        const sts = env.ENV === "dev" ? "idle" : "online";
        const txt =
            env.ENV === "dev" ? "Em desenvolvimento" : "/info | pontobot.xyz";

        await client.user.setPresence({
            status: sts,
            activities: [
                {
                    name: txt,
                    type: 2
                }
            ]
        });
    }
});
