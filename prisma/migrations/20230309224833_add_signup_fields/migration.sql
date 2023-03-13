/*
  Warnings:

  - Added the required column `companyName` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "companyName" TEXT NOT NULL DEFAULT 'Company Name';

-- Drop the default
ALTER TABLE "Organization" ALTER COLUMN "companyName" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT NOT NULL DEFAULT 'First',
ADD COLUMN     "lastName" TEXT NOT NULL DEFAULT 'Last';

ALTER TABLE "User" ALTER COLUMN "firstName" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "lastName" DROP DEFAULT;