/*
  Warnings:

  - You are about to drop the column `slug` on the `Action` table. All the data in the column will be lost.
  - Added the required column `name` to the `Action` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Action" DROP COLUMN "slug",
ADD COLUMN     "name" TEXT NOT NULL;
