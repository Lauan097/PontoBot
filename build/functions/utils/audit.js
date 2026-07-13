import { prisma } from "#database";
async function setAudit({
  guildId,
  userId,
  targetUserId = null,
  action,
  oldValue = null,
  newValue = null
}) {
  try {
    await prisma.audit.create({
      data: {
        guildId,
        userId,
        targetUserId,
        action,
        oldValue: oldValue !== null && oldValue !== void 0 ? String(oldValue) : null,
        newValue: newValue !== null && newValue !== void 0 ? String(newValue) : null
      }
    });
  } catch (error) {
    console.error(`[AUDIT] Erro ao criar auditoria para a a\xE7\xE3o ${action}:`, error);
  }
}
export {
  setAudit
};
