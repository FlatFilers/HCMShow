import { EmployeeType } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { Record } from "./flatfile";
import { prismaClient } from "./prisma-client";

// TODO: Temp solution until we get more of the fields in the config
export const upsertEmployee = async ({
  organizationId,
  employeeId,
  employeeTypeId,
  titleId,
  socialSuffixId,
  hireReasonId,
  hireDate,
  endEmploymentDate,
  locationId,
  managerId,
  jobFamilyId,
  positionTimeId,
  flatfileRecordId,
}: {
  organizationId: string;
  employeeId: string;
  employeeTypeId: string;
  titleId: string;
  socialSuffixId: string;
  hireReasonId: string;
  hireDate: Date;
  endEmploymentDate: Date | null;
  locationId: string;
  managerId?: string;
  jobFamilyId: string;
  positionTimeId: string;
  flatfileRecordId?: string;
}) => {
  const positionTime = await prismaClient.positionTime.findFirst();
  if (!positionTime) {
    throw "Error upsertEmployees(): no positionTime record";
  }
  const payRate = await prismaClient.payRate.findFirst();
  if (!payRate) {
    throw "Error upsertEmployees(): no payRate record";
  }
  const additionalJobClassification =
    await prismaClient.additionalJobClassification.findFirst();
  if (!additionalJobClassification) {
    throw "Error upsertEmployees(): no additionalJobClassification record";
  }
  const workerCompensationCode =
    await prismaClient.workerCompensationCode.findFirst();
  if (!workerCompensationCode) {
    throw "Error upsertEmployees(): no workerCompensationCode record";
  }

  return await prismaClient.employee.upsert({
    where: {
      employeeId,
    },
    create: {
      employeeId: employeeId,
      managerId: managerId,
      organizationId: organizationId,
      titleId,
      socialSuffixId,
      hireReasonId,
      firstName: faker.name.firstName(),
      middleName: faker.name.middleName(),
      lastName: faker.name.lastName(),
      name: faker.name.fullName(),
      employeeTypeId,
      hireDate,
      endEmploymentDate,
      jobFamilyId,
      positionTitle: "Sales Rep",
      businessTitle: "Sales Rep",
      locationId,
      // workspaceId: workspace.id,
      positionTimeId,
      // workShiftId: workShift.id,
      defaultWeeklyHours: 40,
      scheduledWeeklyHours: 40,
      payRateId: payRate.id,
      additionalJobClassificationId: additionalJobClassification.id,
      workerCompensationCodeId: workerCompensationCode.id,
      flatfileRecordId,
    },
    update: {},
  });
};

export const validRecords = async (records: Record[]) => {
  // Find required fields
  const result: { column_name: string }[] = await prismaClient.$queryRaw`
    SELECT column_name 
    FROM information_schema.columns
    WHERE table_name = 'Employee'
      AND is_nullable = 'NO'
      AND column_name NOT IN ('createdAt', 'updatedAt')
      AND (column_name = 'employeeId' OR column_name NOT ILIKE '%id')
  `;
  const requiredFields = result.map((r) => r.column_name);

  // Record is valid if every required field is valid
  return records.filter((r) => {
    return requiredFields.every((f) => r.values[f]?.valid);
  });
};
