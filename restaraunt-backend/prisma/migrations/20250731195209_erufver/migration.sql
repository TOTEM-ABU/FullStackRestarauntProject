/*
  Warnings:

  - Added the required column `amount` to the `Withdraw` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Withdraw" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "description" TEXT;
