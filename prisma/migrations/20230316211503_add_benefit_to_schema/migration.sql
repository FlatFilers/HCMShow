-- CreateTable
CREATE TABLE "EmployeeBenefitPlan" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employeeId" UUID NOT NULL,
    "benefitPlanId" UUID NOT NULL,

    CONSTRAINT "EmployeeBenefitPlan_pkey" PRIMARY KEY ("employeeId","benefitPlanId")
);

-- CreateTable
CREATE TABLE "BenefitPlan" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" UUID NOT NULL,

    CONSTRAINT "BenefitPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BenefitPlan_slug_key" ON "BenefitPlan"("slug");

-- AddForeignKey
ALTER TABLE "EmployeeBenefitPlan" ADD CONSTRAINT "EmployeeBenefitPlan_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeBenefitPlan" ADD CONSTRAINT "EmployeeBenefitPlan_benefitPlanId_fkey" FOREIGN KEY ("benefitPlanId") REFERENCES "BenefitPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenefitPlan" ADD CONSTRAINT "BenefitPlan_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
