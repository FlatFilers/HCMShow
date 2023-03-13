/*
  Warnings:

  - You are about to drop the column `description` on the `EmployeeType` table. All the data in the column will be lost.
  - You are about to drop the column `isFixedTerm` on the `EmployeeType` table. All the data in the column will be lost.
  - You are about to drop the column `isInactive` on the `EmployeeType` table. All the data in the column will be lost.
  - You are about to drop the column `isSeasonal` on the `EmployeeType` table. All the data in the column will be lost.
  - You are about to drop the column `isTrainee` on the `EmployeeType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EmployeeType" DROP COLUMN "description",
DROP COLUMN "isFixedTerm",
DROP COLUMN "isInactive",
DROP COLUMN "isSeasonal",
DROP COLUMN "isTrainee";
