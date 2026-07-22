"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export interface SettingsData {
  weeklyGoalActive: boolean;
  weeklyGoalSeconds: number | null;
  pointOpenLogChannelId: string | null;
  pointCloseLogChannelId: string | null;
  pointOpenRoleId: string | null;
  pointPauseRoleId: string | null;
  pointCloseRoleId: string | null;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  hexColor: string;
}

export interface GetSettingsResponse {
  settings?: SettingsData;
  channels?: DiscordChannel[];
  roles?: DiscordRole[];
  error?: string;
  description?: string;
}

export async function getSettingsAction(guildId: string): Promise<GetSettingsResponse> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return { error: "Não autenticado." };
  }

  const apiUrl = process.env.FASTIFY_API_URL;
  const res = await fetch(`${apiUrl}/guilds/${guildId}/pm/settings`, {
    headers: {
      "X-Internal-Secret": process.env.INTERNAL_API_SECRET!,
      "X-User-Id": session.user.id,
      "X-User-Discord-Id": session.user.discordId
    },
    cache: "no-store"
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    return {
      error: errorData.error || "Erro ao carregar configurações.",
      description: errorData.description
    };
  }

  const data = await res.json();
  return data;
}

export async function updateSettingsAction(
  guildId: string,
  settings: SettingsData
): Promise<{ success: boolean; error?: string; description?: string }> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return { success: false, error: "Não autenticado." };
  }

  const apiUrl = process.env.FASTIFY_API_URL;
  const res = await fetch(`${apiUrl}/guilds/${guildId}/pm/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Secret": process.env.INTERNAL_API_SECRET!,
      "X-User-Id": session.user.id,
      "X-User-Discord-Id": session.user.discordId
    },
    body: JSON.stringify(settings)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.error || "Erro ao salvar configurações.",
      description: errorData.description
    };
  }

  return { success: true };
}
