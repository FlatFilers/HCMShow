/*
  Warnings:

  - You are about to drop the column `employeeContribution` on the `EmployeeBenefitPlan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EmployeeBenefitPlan" DROP COLUMN "employeeContribution",
ADD COLUMN     "employeerContribution" DOUBLE PRECISION NOT NULL DEFAULT 0;
