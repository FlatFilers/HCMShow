import { Record } from "./flatfile-legacy";
import { prismaClient } from "./prisma-client";

// TODO: Temp solution until we get more of the fields in the config
export const upsertEmployee = async ({
  organizationId,
  employeeId,
  employeeTypeId,
  firstName,
  lastName,
  hireDate,
  endEmploymentDate,
  positionTitle,
  managerId,
  defaultWeeklyHours,
  scheduledWeeklyHours,
  flatfileRecordId,
  jobId,
}: {
  organizationId: string;
  employeeId: string;
  employeeTypeId: string;
  firstName: string;
  lastName: string;
  hireDate: Date;
  endEmploymentDate: Date | null;
  positionTitle: string;
  managerId?: string;
  defaultWeeklyHours: number;
  scheduledWeeklyHours: number;
  flatfileRecordId?: string;
  jobId: string;
}) => {
  const employee = await prismaClient.employee.upsert({
    where: {
      organizationId_employeeId: {
        organizationId,
        employeeId,
      },
    },
    create: {
      organizationId,
      employeeId,
      managerId,
      firstName,
      lastName,
      employeeTypeId,
      hireDate,
      endEmploymentDate,
      positionTitle,
      defaultWeeklyHours,
      scheduledWeeklyHours,
      flatfileRecordId,
      jobId,
    },
    update: {},
  });

  return employee;
};

export const validEmployeeRecords = async (records: Record[]) => {
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
