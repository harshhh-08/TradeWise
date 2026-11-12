/*
  Warnings:

  - Added the required column `endDate` to the `ReplaySession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReplaySession" ADD COLUMN     "currentIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'INITIALIZED',
ADD COLUMN     "timeframe" TEXT NOT NULL DEFAULT '1D',
ADD COLUMN     "totalCandles" INTEGER NOT NULL DEFAULT 0;
