/*
  Warnings:

  - You are about to drop the column `email` on the `Organization` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Organization_email_key";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "email";
