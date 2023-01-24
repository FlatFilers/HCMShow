import { Prisma, PrismaClient, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { seedNewAccount } from "./seeds/main";
import { faker } from "@faker-js/faker";
import { DateTime } from "luxon";

const prisma = new PrismaClient();

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
  const prisma = new PrismaClient();

  const employeeType = await prisma.employeeType.findFirst();
  if (!employeeType) {
    throw "Error upsertEmployees(): no employeeType record";
  }
  const jobFamily = await prisma.jobFamily.findFirst();
  if (!jobFamily) {
    throw "Error upsertEmployees(): no jobFamily record";
  }
  const hireReason = await prisma.hireReason.findFirst();
  if (!hireReason) {
    throw "Error upsertEmployees(): no hireReason record";
  }
  const positionTime = await prisma.positionTime.findFirst();
  if (!positionTime) {
    throw "Error upsertEmployees(): no positionTime record";
  }
  const payRate = await prisma.payRate.findFirst();
  if (!payRate) {
    throw "Error upsertEmployees(): no payRate record";
  }
  const additionalJobClassification =
    await prisma.additionalJobClassification.findFirst();
  if (!additionalJobClassification) {
    throw "Error upsertEmployees(): no additionalJobClassification record";
  }
  const workerCompensationCode =
    await prisma.workerCompensationCode.findFirst();
  if (!workerCompensationCode) {
    throw "Error upsertEmployees(): no workerCompensationCode record";
  }
  const location = await prisma.location.findFirst();
  if (!location) {
    throw "Error upsertEmployees(): no location record";
  }

  return await prisma.employee.upsert({
    where: {
      employeeId,
    },
    create: {
      employeeId: employeeId,
      managerId: managerId,
      organizationId: organizationId,
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
