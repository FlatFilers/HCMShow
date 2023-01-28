/*
  Warnings:

  - Made the column `scheduledWeeklyHours` on table `Employee` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "scheduledWeeklyHours" SET NOT NULL;
