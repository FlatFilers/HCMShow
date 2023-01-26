/*
  Warnings:

  - You are about to drop the column `result` on the `Action` table. All the data in the column will be lost.
  - Added the required column `description` to the `Action` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Action" DROP COLUMN "result",
ADD COLUMN     "description" TEXT NOT NULL;
