/*
  Warnings:

  - A unique constraint covering the columns `[addressId]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `addressId` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "addressId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Address_addressId_key" ON "Address"("addressId");
