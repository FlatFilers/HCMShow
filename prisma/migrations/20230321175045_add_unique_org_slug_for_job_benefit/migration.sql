/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,slug]` on the table `BenefitPlan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,slug]` on the table `Job` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "BenefitPlan_slug_key";

-- DropIndex
DROP INDEX "Job_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "BenefitPlan_organizationId_slug_key" ON "BenefitPlan"("organizationId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Job_organizationId_slug_key" ON "Job"("organizationId", "slug");
