import { bootstrap } from "@constatic/base";
import "#server";

await bootstrap({
    meta: import.meta,
    intents: [
        "Guilds",
        "GuildBans",
        "GuildMembers",
        "GuildMessages"
    ]
});