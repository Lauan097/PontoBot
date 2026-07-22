import "dotenv/config";
import "#server";
import { bootstrap } from "@constatic/base";

await bootstrap({
    meta: import.meta,
    intents: [
        "Guilds",
        "GuildBans",
        "GuildMembers",
        "GuildMessages"
    ]
});