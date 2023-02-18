/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,employeeId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Employee_employeeId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Employee_organizationId_employeeId_key" ON "Employee"("organizationId", "employeeId");
