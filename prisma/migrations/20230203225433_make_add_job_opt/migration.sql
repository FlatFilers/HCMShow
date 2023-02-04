-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_additionalJobClassificationId_fkey";

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "additionalJobClassificationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_additionalJobClassificationId_fkey" FOREIGN KEY ("additionalJobClassificationId") REFERENCES "AdditionalJobClassification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
