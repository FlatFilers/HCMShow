-- AlterTable
ALTER TABLE "EmployeeBenefitPlan" ADD COLUMN     "coverageBeginDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentlyEnrolled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "employeeContribution" DOUBLE PRECISION NOT NULL DEFAULT 0;
