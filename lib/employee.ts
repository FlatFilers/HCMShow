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
    update: {
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
  });

  return employee;
};
