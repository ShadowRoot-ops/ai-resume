-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('SUBSCRIPTION', 'FEATURE_UNLOCK', 'CREDITS');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "featureId" TEXT,
ADD COLUMN     "receipt" TEXT,
ADD COLUMN     "resumeId" TEXT,
ADD COLUMN     "type" "PaymentType" NOT NULL DEFAULT 'CREDITS';
