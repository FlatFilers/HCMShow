/*
  Warnings:

  - You are about to drop the column `actionType` on the `Action` table. All the data in the column will be lost.
  - Added the required column `slug` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Action` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Action" DROP COLUMN "actionType",
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
