/*
  Warnings:

  - You are about to drop the column `stripeId` on the `Subscription` table. All the data in the column will be lost.
  - The `plan` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[razorpaySubId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELLED', 'PAST_DUE');

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "stripeId",
ADD COLUMN     "cancelAt" TIMESTAMP(3),
ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "lastScanReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "monthlyScansUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "razorpaySubId" TEXT,
ADD COLUMN     "trialEndsAt" TIMESTAMP(3),
DROP COLUMN "plan",
ADD COLUMN     "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
DROP COLUMN "status",
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "ResumeTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "company" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT true,
    "thumbnailUrl" TEXT NOT NULL,
    "templateData" JSONB NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "atsScore" INTEGER NOT NULL DEFAULT 85,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeywordPack" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "keywords" TEXT[],
    "isPremium" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeywordPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureUnlock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "razorpayPaymentId" TEXT,

    CONSTRAINT "FeatureUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AtsScoreDetails" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "formattingScore" INTEGER NOT NULL DEFAULT 0,
    "keywordScore" INTEGER NOT NULL DEFAULT 0,
    "skillsGapScore" INTEGER NOT NULL DEFAULT 0,
    "beforeScore" INTEGER,
    "afterScore" INTEGER,
    "missingKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "missingSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suggestions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AtsScoreDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeatureUnlock_userId_idx" ON "FeatureUnlock"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureUnlock_userId_feature_key" ON "FeatureUnlock"("userId", "feature");

-- CreateIndex
CREATE UNIQUE INDEX "AtsScoreDetails_resumeId_key" ON "AtsScoreDetails"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_razorpaySubId_key" ON "Subscription"("razorpaySubId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureUnlock" ADD CONSTRAINT "FeatureUnlock_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureUnlock" ADD CONSTRAINT "FeatureUnlock_subscription_fkey" FOREIGN KEY ("userId") REFERENCES "Subscription"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtsScoreDetails" ADD CONSTRAINT "AtsScoreDetails_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
