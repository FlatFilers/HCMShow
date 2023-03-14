import { EmployeeType, Job } from "@prisma/client";
import { upsertEmployee, validEmployeeRecords } from "./employee";
import { getAccessToken, getRecordsByName } from "./flatfile";
import { prismaClient } from "./prisma-client";
import { SpaceType } from "./space";
import { DateTime } from "luxon";
import { createAction, ActionType } from "./action";
import { validJobRecords, upsertJobRecords } from "./job";

export const syncWorkbookRecords = async ({
  userId,
  organizationId,
  spaceType,
}: {
  userId: string;
  organizationId: string;
  spaceType: SpaceType;
}) => {
  const accessToken = await getAccessToken();

  const employeeRecords = await getRecordsByName(
    userId,
    accessToken,
    "Employees",
    spaceType
  );
  const jobRecords = await getRecordsByName(
    userId,
    accessToken,
    "Jobs",
    spaceType
  );

  const totalRecords = employeeRecords.length + jobRecords.length;

  if (totalRecords === 0) {
    return {
      success: false,
      message: "No Records Found. Did you upload the sample data in Flatfile?",
    };
  }

  const validEmployees = await validEmployeeRecords(employeeRecords);

  console.log("Valid records to sync", validEmployees.length);

  // TODO: Refactor employee logic to its lib file
  const validsManagersFirst = validEmployees.sort((a, b) => {
    return a.values.managerId.value ? 1 : -1;
  });

  const upsertEmployees = validsManagersFirst.map(async (r) => {
    try {
      const values = r.values;
      const employeeTypeId = (
        (await prismaClient.employeeType.findUnique({
          where: { slug: values.employeeType.value as string },
        })) as EmployeeType
      ).id;

      const job = (await prismaClient.job.findUnique({
        where: { slug: values.jobCode.value as string },
      })) as Job;

      let data: Parameters<typeof upsertEmployee>[0] = {
        organizationId,
        employeeId: r.values.employeeId.value as string,
        firstName: r.values.firstName.value as string,
        lastName: r.values.lastName.value as string,
        hireDate: DateTime.fromFormat(
          r.values.hireDate.value as string,
          "yyyy-MM-dd"
        ).toJSDate(),
        endEmploymentDate: r.values.endEmploymentDate.value
          ? DateTime.fromFormat(
              r.values.endEmploymentDate.value as string,
              "yyyy-MM-dd"
            ).toJSDate()
          : null,
        positionTitle: r.values.positionTitle.value as string,
        employeeTypeId,
        defaultWeeklyHours: r.values.defaultWeeklyHours.value as number,
        scheduledWeeklyHours: r.values.scheduledWeeklyHours.value as number,
        flatfileRecordId: r.id,
        jobs: {
          create: { job: { connect: { slug: job.slug } } },
        },
      };

      if (
        r.values.managerId.value &&
        (r.values.managerId.value as string).length > 0
      ) {
        try {
          // Does the manager record already exist?
          let manager = await prismaClient.employee.findUnique({
            where: {
              organizationId_employeeId: {
                organizationId,
                employeeId: r.values.managerId.value as string,
              },
            },
          });

          if (manager) {
            data = { ...data, managerId: manager.id };
          }
        } catch (error) {
          console.error(
            "Error - managerId not found:",
            r.values.managerId.value
          );
        }
      }

      await upsertEmployee(data);
    } catch (error) {
      // throw error;
      console.error(
        `Error: syncing employee record for user ${userId}, record ${r.id}`,
        error
      );
    }
  });

  await Promise.all(upsertEmployees);

  const validJobs = await validJobRecords(jobRecords);

  console.log("Valid job records to sync", validJobs.length);

  const upsertJobs = await upsertJobRecords(validJobs, {
    userId,
    organizationId,
  });

  const message = `Found ${totalRecords} total records. Synced ${validEmployees.length} Employee records.  Synced ${validJobs.length} Job records.`;

  await createAction({
    userId,
    organizationId,
    type: ActionType.SyncRecords,
    description: message,
    metadata: {},
  });

  return {
    success: true,
    message,
  };
};
