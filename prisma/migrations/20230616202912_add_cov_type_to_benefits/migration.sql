/*
  Warnings:

  - Added the required column `benefitCoverageType` to the `EmployeeBenefitPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmployeeBenefitPlan" ADD COLUMN     "benefitCoverageType" TEXT NOT NULL;
