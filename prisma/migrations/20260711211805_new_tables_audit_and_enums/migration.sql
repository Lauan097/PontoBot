/*
  Warnings:

  - You are about to drop the column `participantsIds` on the `point_sessions` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Action" AS ENUM ('update_global_weekly_goal_duration', 'update_global_weekly_goal_status', 'update_user_weekly_goal_duration', 'update_user_weekly_goal_status', 'update_point_open_log_channel_id', 'update_point_close_log_channel_id');

-- AlterEnum
ALTER TYPE "member_flow_action" ADD VALUE 'ban';

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "weeklyGoalActive" BOOLEAN,
ALTER COLUMN "weeklyGoalSeconds" DROP DEFAULT;

-- AlterTable
ALTER TABLE "point_sessions" DROP COLUMN "participantsIds",
ADD COLUMN     "finalParticipantsIds" TEXT[],
ADD COLUMN     "initialParticipantsIds" TEXT[];

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "pointCloseLogChannelId" TEXT,
ADD COLUMN     "pointOpenLogChannelId" TEXT,
ADD COLUMN     "weeklyGoalActive" BOOLEAN,
ADD COLUMN     "weeklyGoalSeconds" INTEGER;

-- CreateTable
CREATE TABLE "audits" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetUserId" TEXT,
    "action" "Action" NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audits_guildId_idx" ON "audits"("guildId");

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
