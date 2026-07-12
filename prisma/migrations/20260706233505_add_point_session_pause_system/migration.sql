-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('active', 'inactive', 'banned', 'out_of_server');

-- CreateEnum
CREATE TYPE "PointSessionStatus" AS ENUM ('active', 'paused', 'finished', 'cancelled');

-- CreateEnum
CREATE TYPE "PauseStatus" AS ENUM ('active', 'finished', 'auto_finished', 'cancelled');

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "weeklyGoalSeconds" INTEGER DEFAULT 0,
    "status" "MemberStatus" NOT NULL DEFAULT 'active',
    "discordId" TEXT NOT NULL,
    "discordTag" TEXT NOT NULL,
    "discordAvatar" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_sessions" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "status" "PointSessionStatus" NOT NULL DEFAULT 'active',
    "weeklyGoalSecondsSnapshot" INTEGER,
    "voiceChannelId" TEXT,
    "activity" TEXT,
    "messageOpenLink" TEXT,
    "messageCloseLink" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "totalSeconds" INTEGER,
    "participantsIds" TEXT[],
    "participantsCount" INTEGER,
    "initialNotes" TEXT,
    "finalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "point_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pauses" (
    "id" TEXT NOT NULL,
    "pointSessionId" TEXT NOT NULL,
    "status" "PauseStatus" NOT NULL DEFAULT 'active',
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pauses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "members_guildId_idx" ON "members"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "members_discordId_guildId_key" ON "members"("discordId", "guildId");

-- CreateIndex
CREATE INDEX "point_sessions_memberId_idx" ON "point_sessions"("memberId");

-- CreateIndex
CREATE INDEX "pauses_pointSessionId_idx" ON "pauses"("pointSessionId");

-- CreateIndex
CREATE INDEX "guilds_discordId_idx" ON "guilds"("discordId");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_sessions" ADD CONSTRAINT "point_sessions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pauses" ADD CONSTRAINT "pauses_pointSessionId_fkey" FOREIGN KEY ("pointSessionId") REFERENCES "point_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 1 sessão ativa por membro
CREATE UNIQUE INDEX one_active_session_per_member ON point_sessions ("memberId") WHERE status = 'active';

-- 1 pausa ativa por sessão
CREATE UNIQUE INDEX one_active_pause_per_session ON pauses ("pointSessionId") WHERE status = 'active';