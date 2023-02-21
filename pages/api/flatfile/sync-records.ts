// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
  AdditionalJobClassification,
  EmployeeType,
  HireReason,
  Location,
  PayRate,
  PositionTime,
  PrismaClient,
  Title,
  WorkerCompensationCode,
} from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { getAccessToken, getRecords } from "../../../lib/flatfile";
import { upsertEmployee, validEmployeeRecords } from "../../../lib/employee";
import { ActionType, createAction } from "../../../lib/action";
import { inspect } from "util";
import { prismaClient } from "../../../lib/prisma-client";
import { DateTime } from "luxon";
import { SpaceType } from "../../../lib/space";
import { upsertJobRecords, validJobRecords } from "../../../lib/job";

type Data = {
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const token = await getToken({
    req: req,
  });
  // console.log("gSSP token", token);

  if (!token?.sub) {
    throw new Error("No session");
  }

  const accessToken = await getAccessToken();

  const records = await getRecords(
    token.sub,
    accessToken,
    SpaceType.WorkbookUpload
  );

  if (records.length === 0) {
    res.redirect(
      "/workbook-upload?flash=error&message=No Records Found. Did you upload the sample data in Flatfile?"
    );
    return;
  }

  const validEmployees = await validEmployeeRecords(records);

  console.log("Valid records to sync", validEmployees.length);

  // TODO: Refactor employee logic to its lib file
  const validsManagersFirst = validEmployees.sort((a, b) => {
    return a.values.managerId.value ? 1 : -1;
  });

  // TODO - hacking this in to get seeds working then do this
  const workerCompensationCodeId = (
    (await prismaClient.workerCompensationCode.findFirst(
      {}
    )) as WorkerCompensationCode
  ).id;
  const addresses = await prismaClient.address.findMany({
    take: 2,
  });

  const upsertEmployees = validsManagersFirst.map(async (r) => {
    try {
      const values = r.values;
      const employeeTypeId = (
        (await prismaClient.employeeType.findUnique({
          where: { slug: values.employeeType.value as string },
        })) as EmployeeType
      ).id;

      // TODO: Needs SDK validation to map to ID
      // const hireReasonId = (
      //   (await prismaClient.hireReason.findUnique({
      //     where: {
      //       subcategorySlug: r.values.hireReason.value as string,
      //     },
      //   })) as HireReason
      // ).id;
      const hireReasonId = (
        (await prismaClient.hireReason.findFirst()) as HireReason
      ).id;

      // TODO: Missing locations in base data
      let locationId;
      try {
        locationId = (
          (await prismaClient.location.findUnique({
            where: { slug: r.values.location.value as string },
          })) as Location
        ).id;
      } catch (error) {
        console.error(
          "Error - record ID:",
          r.id,
          ", location slug not found:",
          r.values.location.value
        );

        locationId = ((await prismaClient.location.findFirst({})) as Location)
          .id;
      }

      const positionTimeId = (
        (await prismaClient.positionTime.findUnique({
          where: { slug: r.values.positionTimeType.value as string },
        })) as PositionTime
      ).id;

      // TODO: map fields in SDK
      let payRateId;
      try {
        payRateId = (
          (await prismaClient.payRate.findUnique({
            where: { slug: r.values.payRateType.value as string },
          })) as PayRate
        ).id;
      } catch (error) {
        console.error(
          "Error - record ID:",
          r.id,
          ", pay rate not found:",
          r.values.payRateType.value
        );

        payRateId = ((await prismaClient.payRate.findFirst()) as PayRate).id;
      }

      let data: Parameters<typeof upsertEmployee>[0] = {
        organizationId: token.organizationId,
        employeeId: r.values.employeeId.value as string,
        hireReasonId,
        firstName: r.values.firstName.value as string,
        lastName: r.values.lastName.value as string,
        hireDate: DateTime.fromFormat(
          r.values.hireDate.value as string,
          "yyyy-MM-dd"
        ).toJSDate(),
        endEmploymentDate: r.values.hireDate.value
          ? DateTime.fromFormat(
              r.values.hireDate.value as string,
              "yyyy-MM-dd"
            ).toJSDate()
          : null,
        positionTitle: r.values.positionTitle.value as string,
        businessTitle: r.values.businessTitle.value as string,
        locationId,
        employeeTypeId,
        positionTimeId,
        defaultWeeklyHours: r.values.defaultWeeklyHours.value as number,
        scheduledWeeklyHours: r.values.scheduledWeeklyHours.value as number,
        payRateId,
        workerCompensationCodeId,
        addresses,
        flatfileRecordId: r.id,
      };

      if (values.middleName.value) {
        data = { ...data, middleName: values.middleName.value as string };
      }

      if (values.title.value) {
        const titleId = (
          (await prismaClient.title.findUnique({
            where: {
              slug: values.title.value as string,
            },
          })) as Title
        ).id;

        data = { ...data, titleId };
      }

      if (values.socialSuffix.value) {
        const socialSuffixId = (
          (await prismaClient.title.findUnique({
            where: {
              slug: values.socialSuffix.value as string,
            },
          })) as Title
        ).id;

        data = { ...data, socialSuffixId };
      }

      if (r.values.additionalJobClassification.value) {
        try {
          const additionalJobClassificationId = (
            (await prismaClient.additionalJobClassification.findUnique({
              where: {
                slug: r.values.additionalJobClassification.value as string,
              },
            })) as AdditionalJobClassification
          ).id;

          data = { ...data, additionalJobClassificationId };
        } catch (error) {
          console.error(
            "Error - additionalJobClassification slug not found:",
            r.values.additionalJobClassification.value
          );
        }
      }

      if (r.values.workspace.value) {
        // TODO: Missing locations in base data?
        try {
          const workspaceId = (
            (await prismaClient.location.findUnique({
              where: { slug: r.values.workspace.value as string },
            })) as Location
          ).id;

          data = { ...data, workspaceId };
        } catch (error) {
          console.error(
            "Error - workspace (location) slug not found:",
            r.values.workspace.value
          );
        }
      }

      if (
        r.values.managerId.value &&
        (r.values.managerId.value as string).length > 0
      ) {
        try {
          // Does the manager record already exist?
          let manager = await prismaClient.employee.findUnique({
            where: {
              organizationId_employeeId: {
                organizationId: token.organizationId,
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
        `Error: syncing record for user ${token.sub}, record ${r.id}`,
        error
      );
    }
  });

  await Promise.all(upsertEmployees);

  const validJobs = await validJobRecords(records);

  console.log("Valid job records to sync", validJobs.length);

  const upsertJobs = await upsertJobRecords(validJobs, token);

  const message = `Found ${records.length} total records. Synced ${validEmployees.length} Employee records.  Synced ${validJobs.length} Job records.`;

  await createAction({
    userId: token.sub,
    organizationId: token.organizationId,
    type: ActionType.SyncRecords,
    description: message,
    metadata: {},
  });

  res.redirect(`/workbook-upload?flash=success&message=${message}`);
}
