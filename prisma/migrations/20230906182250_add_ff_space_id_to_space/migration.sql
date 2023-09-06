/*
  Warnings:

  - A unique constraint covering the columns `[flatfileSpaceId]` on the table `Space` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `flatfileSpaceId` to the `Space` table without a default value. This is not possible if the table is not empty.

*/

-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "flatfileSpaceId" TEXT;

-- 1. Backfill the flatfileSpaceId column
UPDATE "Space"
SET "flatfileSpaceId" = "flatfileData"->>'id'
WHERE "flatfileSpaceId" IS NULL;

-- 2. Make flatfileSpaceId NOT NULL (assuming all rows have been backfilled successfully)
ALTER TABLE "Space" ALTER COLUMN "flatfileSpaceId" SET NOT NULL;


-- CreateIndex
CREATE UNIQUE INDEX "Space_flatfileSpaceId_key" ON "Space"("flatfileSpaceId");
