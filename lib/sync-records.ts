import { EmployeeType, Prisma } from "@prisma/client";
import { upsertEmployee } from "./employee";
import { prismaClient } from "./prisma-client";
import { SpaceType } from "./space";
import { DateTime } from "luxon";
import { createAction, ActionType } from "./action";
import { upsertJobRecords } from "./job";
import { upsertBenefitPlan, upsertBenefitPlanRecords } from "./benefit-plan";
import { upsertEmployeeBenefitPlanRecords } from "./employee-benefit-plan";
import { WorkflowType, getRecordsByName } from "./flatfile";

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

  if (employeeRecords) {
    // TODO: Refactor employee logic to its lib file
    const validsManagersFirst = employeeRecords?.sort((a, b) => {
      return a.values.managerId.value ? 1 : -1;
    });

    const upsertEmployees = validsManagersFirst?.map(async (r) => {
      try {
        const values = r.values;
        const employeeTypeId = (
          (await prismaClient.employeeType.findUnique({
            where: { slug: values.employeeType.value as string },
          })) as EmployeeType
        ).id;

        let recordJobCode = () => {
          if (values.jobCode && values.jobCode.value) {
            return values.jobCode.value as string;
          } else {
            let jobName = values.jobName.value as string;

            return jobName.replaceAll(" ", "_");
          }
        };

        let job = await prismaClient.job.upsert({
          where: {
            organizationId_slug: {
              organizationId,
              slug: recordJobCode(),
            },
          },
          create: {
            slug: recordJobCode(),
            name: values.jobName.value as string,
            department: "Test Department",
            effectiveDate: DateTime.now().toJSDate(),
            isInactive: false,
            organization: {
              connect: {
                id: organizationId,
              },
            },
          },
          update: {},
        });

        const jobId = job.id;

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
          jobId: jobId,
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
  }

  const message = `Found ${totalRecords} total records. Synced ${numEmployeeRecords} Employee records.  Synced ${numJobRecords} Job records.`;

  await createAction({
    userId,
    organizationId,
    type: actionType,
    description: message,
    metadata: { topic: "records:syncedToHCMShow" },
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
}: {
  workflow: WorkflowType;
  userId: string;
  organizationId: string;
  spaceType: SpaceType;
  actionType: ActionType;
}) => {
  const employeeBenefitRecords = await getRecordsByName({
    workflow,
    userId,
    workbookName: "Benefits Workbook",
    sheetName: "Benefit Elections",
    spaceType,
  });

  const totalRecords = employeeBenefitRecords?.length;

  if (totalRecords === 0) {
    await createAction({
      userId,
      organizationId,
      type: actionType,
      description: "Synced employee benefits. No records found.",
      metadata: {
        topic: "records:syncedToHCMShow",
        seen: false,
      },
    });

    return;
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
      topic: "records:syncedToHCMShow",
      seen: false,
    },
  });

  // console.log("action", action);

  return {
    success: true,
    message,
  };
};
