/*
  Warnings:

  - You are about to drop the column `nameSlug` on the `EmployeeType` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `EmployeeType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `EmployeeType` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "EmployeeType_nameSlug_key";

-- AlterTable
ALTER TABLE "EmployeeType" DROP COLUMN "nameSlug",
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeType_slug_key" ON "EmployeeType"("slug");
