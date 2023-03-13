/*
  Warnings:

  - You are about to drop the column `additionalDescription` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `includeJobCodeInName` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `jobPublic` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `workShift` on the `Job` table. All the data in the column will be lost.
  - Added the required column `department` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "additionalDescription",
DROP COLUMN "description",
DROP COLUMN "includeJobCodeInName",
DROP COLUMN "jobPublic",
DROP COLUMN "summary",
DROP COLUMN "title",
DROP COLUMN "workShift",
ADD COLUMN     "department" TEXT NOT NULL DEFAULT '';

-- Drop default value for column "department" on table "Job"
-- AlterTable 
ALTER TABLE "Job" ALTER COLUMN "department" DROP DEFAULT;
