import { faker } from "@faker-js/faker";
import { Record } from "./flatfile";
import { prismaClient } from "./prisma-client";
import { Address, prisma } from "@prisma/client";

// TODO: Temp solution until we get more of the fields in the config
export const upsertEmployee = async ({
  organizationId,
  employeeId,
  employeeTypeId,
  titleId,
  socialSuffixId,
  hireReasonId,
  firstName,
  middleName,
  lastName,
  hireDate,
  endEmploymentDate,
  positionTitle,
  businessTitle,
  locationId,
  workspaceId,
  managerId,
  jobFamilyId,
  positionTimeId,
  defaultWeeklyHours,
  scheduledWeeklyHours,
  payRateId,
  additionalJobClassificationId,
  workerCompensationCodeId,
  addresses,
  flatfileRecordId,
}: {
  organizationId: string;
  employeeId: string;
  employeeTypeId: string;
  titleId?: string;
  socialSuffixId?: string;
  hireReasonId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  hireDate: Date;
  endEmploymentDate: Date | null;
  positionTitle: string;
  businessTitle: string;
  locationId: string;
  workspaceId?: string;
  managerId?: string;
  jobFamilyId: string;
  positionTimeId: string;
  defaultWeeklyHours: number;
  scheduledWeeklyHours: number;
  payRateId: string;
  additionalJobClassificationId?: string;
  workerCompensationCodeId: string;
  addresses: Address[];
  flatfileRecordId?: string;
}) => {
  const employee = await prismaClient.employee.upsert({
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
      firstName,
      middleName,
      lastName,
      // TODO: remove
      name: faker.name.fullName(),
      employeeTypeId,
      hireDate,
      endEmploymentDate,
      jobFamilyId,
      positionTitle,
      businessTitle,
      locationId,
      workspaceId,
      positionTimeId,
      // workShiftId: workShift.id,
      defaultWeeklyHours,
      scheduledWeeklyHours,
      payRateId,
      additionalJobClassificationId,
      workerCompensationCodeId,
      flatfileRecordId,
    },
    update: {},
  });

  await prismaClient.employee.update({
    where: {
      employeeId,
    },
    data: {
      addresses: {
        connectOrCreate: addresses.map((a) => {
          return {
            where: {
              addressId_employeeId: {
                addressId: a.id,
                employeeId: employee.id,
              },
            },
            create: {
              addressId: a.id,
            },
          };
        }),
      },
    },
  });

  return employee;
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
