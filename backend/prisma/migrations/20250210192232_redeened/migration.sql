-- AlterTable
ALTER TABLE "Otp" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '15 minutes';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "redeemed" BOOLEAN NOT NULL DEFAULT false;
