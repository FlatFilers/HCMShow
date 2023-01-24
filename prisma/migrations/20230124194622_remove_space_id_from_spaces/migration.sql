/*
  Warnings:

  - You are about to drop the column `flatfileSpaceId` on the `Space` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Space_flatfileSpaceId_key";

-- AlterTable
ALTER TABLE "Space" DROP COLUMN "flatfileSpaceId";
