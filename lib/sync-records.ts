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

  type UpsertEmployeeRetryData = [
    Parameters<typeof upsertEmployee>[0],
    {
      recordManagerId: string;
    }
  ];

  let employeesWithoutMangersInDB: UpsertEmployeeRetryData[] = [];

  const upsertEmployeeAddingManager = async (
    data: Parameters<typeof upsertEmployee>[0],
    flatfileManagerId: string,
    inRetryLoop: boolean = false
  ) => {
    try {
      // Does the manager record already exist?
      let manager = await prismaClient.employee.findUnique({
        where: {
          organizationId_employeeId: {
            organizationId,
            employeeId: flatfileManagerId as string,
          },
        },
      });

      if (manager === null && !inRetryLoop) {
        const recordManagerId = flatfileManagerId.toString();
        const retrydata: UpsertEmployeeRetryData = [
          data,
          { recordManagerId: recordManagerId },
        ];

        employeesWithoutMangersInDB.push(retrydata);
      } else {
        data = { ...data, managerId: manager?.id };
      }
    } catch (error) {
      console.error("Error - managerId not found:", flatfileManagerId);
    }

    await upsertEmployee(data);
  };

  if (employeeRecords) {
    // TODO: Refactor employee logic to its lib file
    const validsManagersFirst = employeeRecords?.sort((a, b) => {
      return a.values.managerId.value ? 1 : -1;
    });

    const upsertEmployeesWithManager = async () => {
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

          const recordManagerId = r.values.managerId.value as string;

          await upsertEmployeeAddingManager(data, recordManagerId);
        } catch (error) {
          console.error(
            `Error: syncing employee record for user ${userId}, record ${r.id}`,
            error
          );
        }
      }
    };

    await upsertEmployeesWithManager();

    let retriesAttempted = 0;
    const MAX_RETRY_ATTEMPTS = 2;

    const retryUpsert = async (max_retry_attempts: number) => {
      const inRetryLoop = true;
      while (retriesAttempted < max_retry_attempts) {
        retriesAttempted++;

        for (const employeeArrayData of employeesWithoutMangersInDB) {
          const employeeData = employeeArrayData[0];
          const recordManagerId = employeeArrayData[1].recordManagerId;

          await upsertEmployeeAddingManager(
            employeeData,
            recordManagerId,
            inRetryLoop
          );
        }
      }
    };

    await retryUpsert(MAX_RETRY_ATTEMPTS);
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

type SyncResult = {
  success: boolean;
  message: string;
  successfullySyncedFlatfileRecordIds: string[];
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
}): Promise<SyncResult> => {
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
      successfullySyncedFlatfileRecordIds: [],
    };
  }

  const numEmployeeBenefitRecords = employeeBenefitRecords?.length ?? 0;

  if (!employeeBenefitRecords) {
    return {
      success: false,
      message: "There are no employee benefit records to sync.",
      successfullySyncedFlatfileRecordIds: [],
    };
  }
  const successfullySyncedFlatfileRecordIds =
    await upsertEmployeeBenefitPlanRecords(employeeBenefitRecords, {
      userId,
      organizationId,
    });

  const message = `Synced ${successfullySyncedFlatfileRecordIds.length}/${numEmployeeBenefitRecords} employee benefit plans.`;

  await createAction({
    userId,
    organizationId,
    type: actionType,
    description: message,
    metadata: {
      topic: `Sync:${workflow} Records`,
      seen: false,
    },
  });

  return {
    success: true,
    message,
    successfullySyncedFlatfileRecordIds,
  };
};
