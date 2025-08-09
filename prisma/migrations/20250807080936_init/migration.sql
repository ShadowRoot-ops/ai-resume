/*
  Warnings:

  - Made the column `razorpayPaymentId` on table `FeatureUnlock` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FeatureUnlock" ALTER COLUMN "razorpayPaymentId" SET NOT NULL;
