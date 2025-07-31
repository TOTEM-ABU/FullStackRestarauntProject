/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_name_key";

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "isActive" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "isActive" SET DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
