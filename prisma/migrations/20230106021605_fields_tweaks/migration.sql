/*
  Warnings:

  - Added the required column `positionTitle` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "positionTitle" TEXT NOT NULL;
