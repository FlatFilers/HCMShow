/*
  Warnings:

  - You are about to drop the `EmployeesJobs` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `jobId` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EmployeesJobs" DROP CONSTRAINT "EmployeesJobs_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeesJobs" DROP CONSTRAINT "EmployeesJobs_jobId_fkey";

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "jobId" UUID NOT NULL;

-- DropTable
DROP TABLE "EmployeesJobs";

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
