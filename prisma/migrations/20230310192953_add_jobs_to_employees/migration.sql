-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "jobCode" TEXT NOT NULL DEFAULT 'Job Code';
ALTER TABLE "Employee" ADD COLUMN     "jobName" TEXT NOT NULL DEFAULT 'Job Name';

-- Drop the default
ALTER TABLE "Employee" ALTER COLUMN "jobCode" DROP DEFAULT;
ALTER TABLE "Employee" ALTER COLUMN "jobName" DROP DEFAULT;