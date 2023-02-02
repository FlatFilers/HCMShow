/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `AdditionalJobClassification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `AdditionalJobClassification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isInactive` to the `AdditionalJobClassification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobClassificationId` to the `AdditionalJobClassification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `AdditionalJobClassification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdditionalJobClassification" ADD COLUMN     "countryId" UUID,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "isInactive" BOOLEAN NOT NULL,
ADD COLUMN     "jobClassificationId" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AdditionalJobClassification_slug_key" ON "AdditionalJobClassification"("slug");

-- AddForeignKey
ALTER TABLE "AdditionalJobClassification" ADD CONSTRAINT "AdditionalJobClassification_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
