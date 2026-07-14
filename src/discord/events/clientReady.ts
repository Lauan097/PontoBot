import { createEvent } from "#base";

createEvent({
    name: "Conected Client Discord",
    event: "clientReady",
    async run(client) {
        const sts = process.env.ENV === "dev" ? "idle" : "online";
        const txt =
            process.env.ENV === "dev"
                ? "Em desenvolvimento"
                : "/info | Open beta";

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
