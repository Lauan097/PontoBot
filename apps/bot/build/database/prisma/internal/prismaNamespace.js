import * as runtime from "@prisma/client/runtime/client";
const PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
const PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
const PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
const PrismaClientInitializationError = runtime.PrismaClientInitializationError;
const PrismaClientValidationError = runtime.PrismaClientValidationError;
const sql = runtime.sqltag;
const empty = runtime.empty;
const join = runtime.join;
const raw = runtime.raw;
const Sql = runtime.Sql;
const Decimal = runtime.Decimal;
const getExtensionContext = runtime.Extensions.getExtensionContext;
const prismaVersion = {
  client: "7.8.0",
  engine: "3c6e192761c0362d496ed980de936e2f3cebcd3a"
};
const NullTypes = {
  DbNull: runtime.NullTypes.DbNull,
  JsonNull: runtime.NullTypes.JsonNull,
  AnyNull: runtime.NullTypes.AnyNull
};
const DbNull = runtime.DbNull;
const JsonNull = runtime.JsonNull;
const AnyNull = runtime.AnyNull;
const ModelName = {
  Plan: "Plan",
  Guild: "Guild",
  Settings: "Settings",
  Template: "Template",
  ServerLink: "ServerLink",
  Audit: "Audit",
  Member: "Member",
  PointSession: "PointSession",
  Pause: "Pause",
  MemberFlow: "MemberFlow",
  User: "User",
  Subscription: "Subscription"
};
const TransactionIsolationLevel = runtime.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
const PlanScalarFieldEnum = {
  id: "id",
  slug: "slug",
  name: "name",
  maxServers: "maxServers",
  maxMembersPool: "maxMembersPool",
  priceCents: "priceCents",
  mercadoPagoPlanId: "mercadoPagoPlanId",
  active: "active",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
const GuildScalarFieldEnum = {
  id: "id",
  discordId: "discordId",
  name: "name",
  icon: "icon",
  ownerDiscordId: "ownerDiscordId",
  active: "active",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
const SettingsScalarFieldEnum = {
  guildId: "guildId",
  weeklyGoalActive: "weeklyGoalActive",
  weeklyGoalSeconds: "weeklyGoalSeconds",
  welcomeChannelId: "welcomeChannelId",
  pointOpenLogChannelId: "pointOpenLogChannelId",
  pointCloseLogChannelId: "pointCloseLogChannelId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
const TemplateScalarFieldEnum = {
  id: "id",
  guildId: "guildId",
  name: "name",
  content: "content",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
const ServerLinkScalarFieldEnum = {
  id: "id",
  guildId: "guildId",
  subscriptionId: "subscriptionId",
  linkedByUserId: "linkedByUserId",
  lastKnownMemberCount: "lastKnownMemberCount",
  memberCountCheckedAt: "memberCountCheckedAt",
  status: "status",
  linkedAt: "linkedAt",
  unlinkedAt: "unlinkedAt"
};
const AuditScalarFieldEnum = {
  id: "id",
  guildId: "guildId",
  userId: "userId",
  targetUserId: "targetUserId",
  action: "action",
  oldValue: "oldValue",
  newValue: "newValue",
  createdAt: "createdAt"
};
const MemberScalarFieldEnum = {
  id: "id",
  guildId: "guildId",
  weeklyGoalActive: "weeklyGoalActive",
  weeklyGoalSeconds: "weeklyGoalSeconds",
  status: "status",
  discordId: "discordId",
  discordTag: "discordTag",
  discordAvatar: "discordAvatar",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
const PointSessionScalarFieldEnum = {
  id: "id",
  memberId: "memberId",
  status: "status",
  weeklyGoalSecondsSnapshot: "weeklyGoalSecondsSnapshot",
  voiceChannelId: "voiceChannelId",
  activity: "activity",
  messageOpenLink: "messageOpenLink",
  messageCloseLink: "messageCloseLink",
  startedAt: "startedAt",
  endedAt: "endedAt",
  totalSeconds: "totalSeconds",
  initialParticipantsIds: "initialParticipantsIds",
  finalParticipantsIds: "finalParticipantsIds",
  participantsCount: "participantsCount",
  initialNotes: "initialNotes",
  finalNotes: "finalNotes",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
const PauseScalarFieldEnum = {
  id: "id",
  pointSessionId: "pointSessionId",
  status: "status",
  startedAt: "startedAt",
  endedAt: "endedAt",
  durationSeconds: "durationSeconds",
  reason: "reason",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
const MemberFlowScalarFieldEnum = {
  id: "id",
  guildId: "guildId",
  userId: "userId",
  userTag: "userTag",
  action: "action",
  createdAt: "createdAt"
};
const UserScalarFieldEnum = {
  id: "id",
  discordId: "discordId",
  username: "username",
  email: "email",
  avatar: "avatar",
  discordAccessToken: "discordAccessToken",
  discordRefreshToken: "discordRefreshToken",
  discordTokenExpiresAt: "discordTokenExpiresAt",
  currentPlanId: "currentPlanId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
const SubscriptionScalarFieldEnum = {
  userId: "userId",
  planId: "planId",
  mercadoPagoPreapprovalId: "mercadoPagoPreapprovalId",
  currentPeriodStart: "currentPeriodStart",
  currentPeriodEnd: "currentPeriodEnd",
  cancelAtPeriodEnd: "cancelAtPeriodEnd",
  trialEnd: "trialEnd",
  cancelAt: "cancelAt",
  canceledAt: "canceledAt",
  status: "status",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
const SortOrder = {
  asc: "asc",
  desc: "desc"
};
const JsonNullValueInput = {
  JsonNull
};
const QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
const NullsOrder = {
  first: "first",
  last: "last"
};
const JsonNullValueFilter = {
  DbNull,
  JsonNull,
  AnyNull
};
const defineExtension = runtime.Extensions.defineExtension;
export {
  AnyNull,
  AuditScalarFieldEnum,
  DbNull,
  Decimal,
  GuildScalarFieldEnum,
  JsonNull,
  JsonNullValueFilter,
  JsonNullValueInput,
  MemberFlowScalarFieldEnum,
  MemberScalarFieldEnum,
  ModelName,
  NullTypes,
  NullsOrder,
  PauseScalarFieldEnum,
  PlanScalarFieldEnum,
  PointSessionScalarFieldEnum,
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
  QueryMode,
  ServerLinkScalarFieldEnum,
  SettingsScalarFieldEnum,
  SortOrder,
  Sql,
  SubscriptionScalarFieldEnum,
  TemplateScalarFieldEnum,
  TransactionIsolationLevel,
  UserScalarFieldEnum,
  defineExtension,
  empty,
  getExtensionContext,
  join,
  prismaVersion,
  raw,
  sql
};
