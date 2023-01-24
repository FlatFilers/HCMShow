/*
  Warnings:

  - A unique constraint covering the columns `[employeeId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `employeeId` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "employeeId" TEXT;

UPDATE "Employee" SET "employeeId" = "id";

ALTER TABLE "Employee"
ALTER COLUMN "employeeId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeId_key" ON "Employee"("employeeId");
