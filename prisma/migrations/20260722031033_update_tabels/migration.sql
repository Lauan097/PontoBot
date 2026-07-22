/*
  Warnings:

  - You are about to drop the column `active` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `maxMembersPool` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `maxServers` on the `plans` table. All the data in the column will be lost.
  - The `slug` column on the `plans` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `subscriptions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `currentPlanId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `server_links` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[guildId]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `guildId` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `subscriptions` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `payerId` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Slug" AS ENUM ('free', 'andromeda');

-- DropForeignKey
ALTER TABLE "server_links" DROP CONSTRAINT "server_links_guildId_fkey";

-- DropForeignKey
ALTER TABLE "server_links" DROP CONSTRAINT "server_links_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_userId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_currentPlanId_fkey";

-- AlterTable
ALTER TABLE "guilds" ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "plans" DROP COLUMN "active",
DROP COLUMN "maxMembersPool",
DROP COLUMN "maxServers",
ADD COLUMN     "maxUsers" INTEGER,
DROP COLUMN "slug",
ADD COLUMN     "slug" "Slug",
ALTER COLUMN "priceCents" DROP NOT NULL;

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "pointCloseRoleId" TEXT,
ADD COLUMN     "pointOpenRoleId" TEXT,
ADD COLUMN     "pointPauseRoleId" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_pkey",
DROP COLUMN "userId",
ADD COLUMN     "guildId" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "payerId" TEXT NOT NULL,
ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP COLUMN "currentPlanId";

-- DropTable
DROP TABLE "server_links";

-- DropEnum
DROP TYPE "ServerLinkStatus";

-- CreateIndex
CREATE UNIQUE INDEX "plans_slug_key" ON "plans"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_guildId_key" ON "subscriptions"("guildId");

-- CreateIndex
CREATE INDEX "subscriptions_payerId_idx" ON "subscriptions"("payerId");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
