-- CreateTable
CREATE TABLE "EmployeesJobs" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employeeId" UUID NOT NULL,
    "jobId" UUID NOT NULL,

    CONSTRAINT "EmployeesJobs_pkey" PRIMARY KEY ("employeeId","jobId")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "jobCode" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3),
    "isInactive" BOOLEAN,
    "includeJobCodeInName" BOOLEAN,
    "title" TEXT,
    "summary" TEXT,
    "description" TEXT,
    "additionalDescription" TEXT,
    "workShift" BOOLEAN,
    "jobPublic" BOOLEAN,
    "jobFamilyId" UUID NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobCode_key" ON "Job"("jobCode");

-- AddForeignKey
ALTER TABLE "EmployeesJobs" ADD CONSTRAINT "EmployeesJobs_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeesJobs" ADD CONSTRAINT "EmployeesJobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_jobFamilyId_fkey" FOREIGN KEY ("jobFamilyId") REFERENCES "JobFamily"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
