import { EmployeeType } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { DateTime } from "luxon";
import { Record } from "./flatfile";
import { prismaClient } from "./prisma-client";

// TODO: Temp solution until we get more of the fields in the config
export const upsertEmployee = async ({
  organizationId,
  employeeId,
  employeeTypeId,
  locationId,
  managerId,
  jobFamilyId,
  positionTimeId,
  flatfileRecordId,
}: {
  organizationId: string;
  employeeId: string;
  employeeTypeId: string;
  locationId: string;
  managerId?: string;
  jobFamilyId: string;
  positionTimeId: string;
  flatfileRecordId?: string;
}) => {
  const hireReason = await prismaClient.hireReason.findFirst();
  if (!hireReason) {
    throw "Error upsertEmployees(): no hireReason record";
  }
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
      firstName: faker.name.firstName(),
      middleName: faker.name.middleName(),
      lastName: faker.name.lastName(),
      name: faker.name.fullName(),
      employeeTypeId,
      hireReasonId: hireReason.id,
      hireDate: DateTime.now().toJSDate(),
      endEmploymentDate: null,
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
