import { bootstrap } from "@constatic/base";
import "#server";
import "dotenv/config";

await bootstrap({
    meta: import.meta,
    intents: [
        "Guilds",
        "GuildBans",
        "GuildMembers",
        "GuildMessages"
    ]
});