/*
  Warnings:

  - You are about to drop the column `additionalJobClassificationId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `businessTitle` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `countryId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `hireReasonId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `middleName` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `payRateId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `positionTimeId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `socialSuffixId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `titleId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `workShiftId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `workerCompensationCodeId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceId` on the `Employee` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AddressEmployee" DROP CONSTRAINT "AddressEmployee_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_additionalJobClassificationId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_countryId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_hireReasonId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_locationId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_payRateId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_positionTimeId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_socialSuffixId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_titleId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_workShiftId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_workerCompensationCodeId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_workspaceId_fkey";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "additionalJobClassificationId",
DROP COLUMN "businessTitle",
DROP COLUMN "countryId",
DROP COLUMN "hireReasonId",
DROP COLUMN "locationId",
DROP COLUMN "middleName",
DROP COLUMN "payRateId",
DROP COLUMN "positionTimeId",
DROP COLUMN "socialSuffixId",
DROP COLUMN "titleId",
DROP COLUMN "workShiftId",
DROP COLUMN "workerCompensationCodeId",
DROP COLUMN "workspaceId";
