import { Client, Guild, PermissionFlagsBits } from "discord.js";

export type Success<T> = {
    success: true;
} & T;

export type Failure = {
    success: false;
    error: string;
    description: string;
};

export type IsAdminResult =
    | Success<{
          guild: Guild;
      }>
    | Failure;

export async function isAdmin({
    client,
    guildId,
    userId
}: {
    client: Client;
    guildId: string;
    userId: string;
}): Promise<IsAdminResult> {
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        return {
            success: false,
            error: "Servidor não encontrado.",
            description:
                "O servidor não foi encontrado na lista de servidores do bot."
        };
    }

    try {
        const member = await guild.members.fetch(userId);

        const isAdmin =
            guild.ownerId === userId ||
            member.permissions.has(PermissionFlagsBits.Administrator);

        if (!isAdmin) {
            return {
                success: false,
                error: "Acesso não autorizado.",
                description:
                    "Você não tem permissão de administrador neste servidor."
            };
        }

        return {
            success: true,
            guild
        };
    } catch {
        return {
            success: false,
            error: "Membro não encontrado.",
            description: "Não foi possível obter os dados do membro."
        };
    }
}
