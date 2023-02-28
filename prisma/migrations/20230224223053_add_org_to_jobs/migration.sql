/*
  Warnings:

  - Added the required column `organizationId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "organizationId" UUID NULL;

UPDATE "Job" 
SET "organizationId" = "Employee"."organizationId"
FROM "Employee"
JOIN "EmployeesJobs" ON "EmployeesJobs"."employeeId" = "Employee"."id"
WHERE "Job"."id" = "EmployeesJobs"."jobId";

ALTER TABLE "Job" ALTER COLUMN "organizationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
