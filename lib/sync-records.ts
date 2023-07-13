import { EmployeeType } from "@prisma/client";
import { upsertEmployee } from "./employee";
import { prismaClient } from "./prisma-client";
import { SpaceType } from "./space";
import { createAction, ActionType } from "./action";
import { upsertJobRecords } from "./job";
import { upsertEmployeeBenefitPlanRecords } from "./employee-benefit-plan";
import { WorkflowType, getRecordsByName } from "./flatfile";
import { parseDate } from "./utils";

export const syncWorkbookRecords = async ({
  workflow,
  userId,
  organizationId,
  spaceType,
  actionType,
}: {
  workflow: WorkflowType;
  userId: string;
  organizationId: string;
  spaceType: SpaceType;
  actionType: ActionType;
}) => {
  const employeeRecords = await getRecordsByName({
    workflow,
    userId,
    workbookName: process.env.ONBOARDING_WORKBOOK_NAME as string,
    sheetName: "Employees",
    spaceType,
  });
  const jobRecords = await getRecordsByName({
    workflow,
    userId,
    workbookName: process.env.ONBOARDING_WORKBOOK_NAME as string,
    sheetName: "Jobs",
    spaceType,
  });

  const numEmployeeRecords = employeeRecords?.length ?? 0;
  const numJobRecords = jobRecords?.length ?? 0;

  const totalRecords = numEmployeeRecords + numJobRecords;

  if (totalRecords === 0) {
    await createAction({
      userId,
      organizationId,
      type: actionType,
      description: "Synced project onboarding. No records found.",
      metadata: {
        topic: `Sync:${workflow} Records`,
        seen: false,
      },
    });
    return {
      success: false,
      message: "No Records Found. Did you upload the sample data in Flatfile?",
    };
  }

  // console.log("Valid job records to sync", numJobRecords);

  if (jobRecords) {
    const upsertJobs = await upsertJobRecords(jobRecords, {
      userId,
      organizationId,
    });
  }

  type RetryData = [
    {
      organizationId: string;
      employeeId: string;
      employeeTypeId: string;
      firstName: string;
      lastName: string;
      hireDate: Date;
      endEmploymentDate: Date | null;
      positionTitle: string;
      defaultWeeklyHours: number;
      scheduledWeeklyHours: number;
      flatfileRecordId?: string | undefined;
      jobId: string;
    },
    {
      recordManagerId: string;
    }
  ];

  if (employeeRecords) {
    // TODO: Refactor employee logic to its lib file
    const validsManagersFirst = employeeRecords?.sort((a, b) => {
      return a.values.managerId.value ? 1 : -1;
    });

    let employeesWithoutMangersInDB: Array<RetryData> = [];

    for (const r of validsManagersFirst) {
      try {
        const values = r.values;
        const employeeTypeId = (
          (await prismaClient.employeeType.findUnique({
            where: { slug: values.employeeType.value as string },
          })) as EmployeeType
        ).id;

        // TODO: We should be looking up with findUnique and slug (jobCode),
        // but the hooks in Flatfile aren't always populating that value.
        // .findFirst could bite us here.
        const job = await prismaClient.job.findFirst({
          where: {
            organizationId,
            name: values.jobName.value as string,
          },
        });

        if (!job) {
          throw new Error(
            `Error: job not found for employeeId ${
              r.values.employee.value
            }, jobName: ${values.jobName.value as string}`
          );
        }

        const hireDate = parseDate({
          fieldName: "hireDate",
          value: values.hireDate.value as string,
        });

        let data: Parameters<typeof upsertEmployee>[0] = {
          organizationId,
          employeeId: r.values.employeeId.value as string,
          firstName: r.values.firstName.value as string,
          lastName: r.values.lastName.value as string,
          hireDate: hireDate.toJSDate(),
          endEmploymentDate: r.values.endEmploymentDate.value
            ? parseDate({
                fieldName: "endEmploymentDate",
                value: values.endEmploymentDate.value as string,
              }).toJSDate()
            : null,
          positionTitle: r.values.positionTitle.value as string,
          employeeTypeId,
          defaultWeeklyHours: r.values.defaultWeeklyHours.value as number,
          scheduledWeeklyHours: r.values.scheduledWeeklyHours.value as number,
          flatfileRecordId: r.id,
          jobId: job.id,
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
            } else {
              const recordManagerId = r.values.managerId.value.toString()
              const retrydata: RetryData = [data, {recordManagerId: recordManagerId}];

              employeesWithoutMangersInDB.push(retrydata);
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
        console.error(
          `Error: syncing employee record for user ${userId}, record ${r.id}`,
          error
        );
      }
    }

    for (const employeeData of employeesWithoutMangersInDB) {
      try {
        let manager = await prismaClient.employee.findUnique({
          where: {
            organizationId_employeeId: {
              organizationId,
              employeeId: employeeData[1].recordManagerId,
            },
          },
        });

        const employee = { ...employeeData[0], managerId: manager?.id };

        await upsertEmployee(employee);
      } catch (error) {
        console.error("Error - managerId not found");
      }
    }
  }

  const message = `Found ${totalRecords} total records. Synced ${numEmployeeRecords} Employee records.  Synced ${numJobRecords} Job records.`;

  await createAction({
    userId,
    organizationId,
    type: actionType,
    description: message,
    metadata: { topic: `Sync:${workflow} Records` },
  });

  return {
    success: true,
    message,
  };
};

export const syncBenefitPlanRecords = async ({
  workflow,
  userId,
  organizationId,
  spaceType,
  actionType,
  spaceId,
}: {
  workflow: WorkflowType;
  userId: string;
  organizationId: string;
  spaceType: SpaceType;
  actionType: ActionType;
  spaceId?: string;
}) => {
  const employeeBenefitRecords = await getRecordsByName({
    workflow,
    userId,
    workbookName: "Benefits Workbook",
    sheetName: "Benefit Elections",
    spaceType,
    spaceId,
  });

  const totalRecords = employeeBenefitRecords?.length;

  if (totalRecords === 0) {
    await createAction({
      userId,
      organizationId,
      type: actionType,
      description: "Synced employee benefits. No records found.",
      metadata: {
        topic: `Sync:${workflow} Records`,
        seen: false,
      },
    });

    return {
      success: false,
      message: "No Records Found. Did you upload the sample data in Flatfile?",
    };
  }

  const numEmployeeBenefitRecords = employeeBenefitRecords?.length ?? 0;

  if (!employeeBenefitRecords) {
    return {
      success: false,
      message: "There are no employee benefit records to sync.",
    };
  }
  const count = await upsertEmployeeBenefitPlanRecords(employeeBenefitRecords, {
    userId,
    organizationId,
  });

  const message = `Synced ${count}/${numEmployeeBenefitRecords} employee benefit plans.`;

  // console.log("topic", topic);

  const action = await createAction({
    userId,
    organizationId,
    type: actionType,
    description: message,
    metadata: {
      topic: `Sync:${workflow} Records`,
      seen: false,
    },
  });

  // console.log("action", action);

  return {
    success: true,
    message,
  };
};
