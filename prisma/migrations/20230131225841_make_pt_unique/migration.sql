/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `PositionTime` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PositionTime_slug_key" ON "PositionTime"("slug");
