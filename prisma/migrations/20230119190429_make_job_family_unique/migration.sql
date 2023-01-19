/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `JobFamily` will be added. If there are existing duplicate values, this will fail.
  - Made the column `slug` on table `JobFamily` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "JobFamily" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "JobFamily_slug_key" ON "JobFamily"("slug");
