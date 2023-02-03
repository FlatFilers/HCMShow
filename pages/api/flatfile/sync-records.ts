// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
  AdditionalJobClassification,
  EmployeeType,
  HireReason,
  JobFamily,
  Location,
  PayRate,
  PositionTime,
  PrismaClient,
  Title,
  WorkerCompensationCode,
} from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { getAccessToken, getRecords } from "../../../lib/flatfile";
import { upsertEmployee, validRecords } from "../../../lib/employee";
import { ActionType, createAction } from "../../../lib/action";
import { inspect } from "util";
import { prismaClient } from "../../../lib/prisma-client";
import { DateTime } from "luxon";

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

  const records = await getRecords(token.sub, accessToken);

  if (records.length === 0) {
    res.redirect("/onboarding?flash=error&message=No Records Found");
    return;
  }

  console.log("record[0]", inspect(records[0], { depth: null }));

  const valids = await validRecords(records);

  // console.log("valids", valids.length);

  const employees = await prismaClient.employee.findMany({
    where: {
      organizationId: token.organizationId,
    },
    select: {
      employeeId: true,
    },
  });
  // console.log("employees", employees);
  const employeeIds = employees.map((e) => e.employeeId);
  // console.log("employeeIds", employeeIds);

  const newEmployeeRecords = valids.filter((r) => {
    return !employeeIds.includes(r.id) && r.values.employeeId.value;
  });
  // console.log("new emp", newEmployeeRecords.length);

  // TODO - hacking this in to get seeds working then do this
  const employeeTypeId = (
    (await prismaClient.employeeType.findFirst()) as EmployeeType
  ).id;
  const titleId = ((await prismaClient.title.findFirst()) as Title).id;
  const socialSuffixId = ((await prismaClient.title.findFirst()) as Title).id;
  const hireReasonId = (
    (await prismaClient.hireReason.findFirst()) as HireReason
  ).id;
  const hireDate = DateTime.now().toJSDate();
  const endEmploymentDate = null;
  const positionTitle = "Sales Rep";
  const businessTitle = "Sales Rep";
  const jobFamilyId = ((await prismaClient.jobFamily.findFirst()) as JobFamily)
    .id;
  const locationId = ((await prismaClient.location.findFirst()) as Location).id;
  const workspaceId = (
    (await prismaClient.location.findFirst({
      orderBy: { name: "desc" },
    })) as Location
  ).id;
  const positionTimeId = (
    (await prismaClient.positionTime.findFirst()) as PositionTime
  ).id;
  const defaultWeeklyHours = 40;
  const scheduledWeeklyHours = 40;
  const payRateId = ((await prismaClient.payRate.findFirst()) as PayRate).id;
  const additionalJobClassificationId = (
    (await prismaClient.additionalJobClassification.findFirst()) as AdditionalJobClassification
  ).id;
  const workerCompensationCodeId = (
    (await prismaClient.workerCompensationCode.findFirst()) as WorkerCompensationCode
  ).id;
  const addresses = await prismaClient.address.findMany({
    take: 2,
  });

  const upserts = newEmployeeRecords.map(async (r) => {
    try {
      const values = r.values;

      let data: Parameters<typeof upsertEmployee>[0] = {
        organizationId: token.organizationId,
        employeeId: r.values.employeeId.value as string,
        titleId,
        socialSuffixId,
        hireReasonId,
        firstName: "todo",
        middleName: "todo",
        lastName: "todo",
        hireDate,
        endEmploymentDate,
        positionTitle,
        businessTitle,
        locationId,
        workspaceId,
        employeeTypeId,
        jobFamilyId,
        positionTimeId,
        defaultWeeklyHours,
        scheduledWeeklyHours,
        payRateId,
        additionalJobClassificationId,
        workerCompensationCodeId,
        addresses,
        flatfileRecordId: r.id,
      };

      if (r.values.managerId.value && r.values.managerId.value.length > 0) {
        // Does the manager record already exist?
        let manager = await prismaClient.employee.findUnique({
          where: {
            employeeId: r.values.managerId.value,
          },
        });

        if (!manager) {
          manager = await upsertEmployee({
            ...data,
            employeeId: r.values.managerId.value,
            managerId: undefined,
          });
        }

        data = { ...data, managerId: manager.id };
      }

      await upsertEmployee(data);
    } catch (error) {
      console.error(
        `Error: syncing record for user ${token.sub}, record ${r.id}`
      );
    }
  });

  await Promise.all(upserts);

  const message = `Found ${records.length} records. Synced ${newEmployeeRecords.length} Employee records.`;

  await createAction({
    userId: token.sub,
    organizationId: token.organizationId,
    type: ActionType.SyncRecords,
    description: message,
  });

  res.redirect(`/onboarding?flash=success&message=${message}`);
}
