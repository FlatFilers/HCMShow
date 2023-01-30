import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { seedNewAccount } from "./seeds/main";
import { faker } from "@faker-js/faker";
import { DateTime } from "luxon";
import { Field, Record } from "./flatfile";
import { inspect } from "util";
import { prismaClient } from "./prisma-client";
import { convertKeyToCamelCase, convertToCamelCase } from "./utils";

// TODO: Temp solution until we get more of the fields in the config
export const upsertEmployee = async ({
  organizationId,
  employeeId,
  managerId,
  flatfileRecordId,
}: {
  organizationId: string;
  employeeId: string;
  managerId?: string;
  flatfileRecordId?: string;
}) => {
  const employeeType = await prismaClient.employeeType.findFirst();
  if (!employeeType) {
    throw "Error upsertEmployees(): no employeeType record";
  }
  const jobFamily = await prismaClient.jobFamily.findFirst();
  if (!jobFamily) {
    throw "Error upsertEmployees(): no jobFamily record";
  }
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
  const location = await prismaClient.location.findFirst();
  if (!location) {
    throw "Error upsertEmployees(): no location record";
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
      employeeTypeId: employeeType.id,
      hireReasonId: hireReason.id,
      hireDate: DateTime.now().toJSDate(),
      endEmploymentDate: null,
      jobFamilyId: jobFamily.id,
      positionTitle: "Sales Rep",
      businessTitle: "Sales Rep",
      locationId: location.id,
      // workspaceId: workspace.id,
      positionTimeId: positionTime.id,
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
