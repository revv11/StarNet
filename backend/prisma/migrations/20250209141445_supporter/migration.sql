-- CreateEnum
CREATE TYPE "Type" AS ENUM ('INVESTOR', 'MENTOR');

-- AlterTable
ALTER TABLE "Otp" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '15 minutes';

-- CreateTable
CREATE TABLE "Supporter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" "Type" NOT NULL,

    CONSTRAINT "Supporter_pkey" PRIMARY KEY ("id")
);
