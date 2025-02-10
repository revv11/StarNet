/*
  Warnings:

  - Added the required column `otp` to the `Otp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Otp" ADD COLUMN     "otp" INTEGER NOT NULL,
ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '15 minutes';
