/*
  Warnings:

  - Added the required column `organizationId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "organizationId" UUID NOT NULL DEFAULT uuid_generate_v4();

ALTER TABLE "Job" ALTER COLUMN "organizationId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
