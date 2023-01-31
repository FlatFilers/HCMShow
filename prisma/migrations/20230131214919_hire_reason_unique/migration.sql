/*
  Warnings:

  - A unique constraint covering the columns `[subcategorySlug]` on the table `HireReason` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HireReason_subcategorySlug_key" ON "HireReason"("subcategorySlug");
