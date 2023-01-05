-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" UUID NOT NULL,
    "managerId" UUID,
    "employeeTypeId" UUID NOT NULL,
    "hireReasonId" UUID NOT NULL,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "endEmploymentDate" TIMESTAMP(3),
    "jobFamilyId" UUID NOT NULL,
    "businessTitle" TEXT,
    "locationId" UUID NOT NULL,
    "workspaceId" UUID,
    "positionTimeId" UUID NOT NULL,
    "workShiftId" UUID,
    "defaultWeeklyHours" INTEGER NOT NULL,
    "scheduledWeeklyHours" INTEGER NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeType" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "nameSlug" TEXT NOT NULL,
    "description" TEXT,
    "isFixedTerm" BOOLEAN NOT NULL,
    "isSeasonal" BOOLEAN NOT NULL,
    "isTrainee" BOOLEAN NOT NULL,
    "isInactive" BOOLEAN NOT NULL,

    CONSTRAINT "EmployeeType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeTypeCountry" (
    "employeeTypeId" UUID NOT NULL,
    "countryId" UUID NOT NULL,

    CONSTRAINT "EmployeeTypeCountry_pkey" PRIMARY KEY ("employeeTypeId","countryId")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HireReason" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isInactive" BOOLEAN NOT NULL,
    "classificationName" TEXT NOT NULL,
    "classificationSlug" TEXT NOT NULL,
    "subcategorySlug" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "isManagerReason" BOOLEAN NOT NULL,

    CONSTRAINT "HireReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobFamily" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "effectiveDate" TIMESTAMP(3),
    "summary" TEXT,
    "isInactive" BOOLEAN NOT NULL,

    CONSTRAINT "JobFamily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PositionTime" (
    "id" UUID NOT NULL,

    CONSTRAINT "PositionTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkShift" (
    "id" UUID NOT NULL,

    CONSTRAINT "WorkShift_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeType_name_key" ON "EmployeeType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeType_nameSlug_key" ON "EmployeeType"("nameSlug");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_employeeTypeId_fkey" FOREIGN KEY ("employeeTypeId") REFERENCES "EmployeeType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_hireReasonId_fkey" FOREIGN KEY ("hireReasonId") REFERENCES "HireReason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_jobFamilyId_fkey" FOREIGN KEY ("jobFamilyId") REFERENCES "JobFamily"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_positionTimeId_fkey" FOREIGN KEY ("positionTimeId") REFERENCES "PositionTime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_workShiftId_fkey" FOREIGN KEY ("workShiftId") REFERENCES "WorkShift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeTypeCountry" ADD CONSTRAINT "EmployeeTypeCountry_employeeTypeId_fkey" FOREIGN KEY ("employeeTypeId") REFERENCES "EmployeeType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeTypeCountry" ADD CONSTRAINT "EmployeeTypeCountry_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
