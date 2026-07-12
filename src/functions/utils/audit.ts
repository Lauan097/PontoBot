import { prisma } from "#database";
import type { Action } from "../../database/prisma/client.js";

export interface AuditParams {
    guildId: string;
    userId: string;
    targetUserId?: string | null;
    action: Action;
    oldValue?: string | number | boolean | null;
    newValue?: string | number | boolean | null;
}

export async function setAudit({
    guildId,
    userId,
    targetUserId = null,
    action,
    oldValue = null,
    newValue = null
}: AuditParams) {
    try {
        await prisma.audit.create({
            data: {
                guildId,
                userId,
                targetUserId,
                action,
                oldValue: oldValue !== null && oldValue !== undefined ? String(oldValue) : null,
                newValue: newValue !== null && newValue !== undefined ? String(newValue) : null,
            }
        });
    } catch (error) {
        console.error(`[AUDIT] Erro ao criar auditoria para a ação ${action}:`, error);
    }
}