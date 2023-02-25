/*
  Warnings:

  - A unique constraint covering the columns `[userId,type]` on the table `Space` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Space_userId_type_key" ON "Space"("userId", "type");
