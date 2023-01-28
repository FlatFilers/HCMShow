// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Employee, PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { getAccessToken, getRecords } from "../../../lib/flatfile";
import {
  mapRecordFieldsForEmployee,
  upsertEmployee,
  validRecords,
} from "../../../lib/employee";
import { ActionType, createAction } from "../../../lib/action";
import { inspect } from "util";
import { convertToCamelCase } from "../../../lib/utils";

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
    res.redirect("/employees?message=No Records Found");
    return;
  }

  const mappedRecords = await mapRecordFieldsForEmployee(records);
  // console.log("mappedRecords", mappedRecords);

  const valids = await validRecords(mappedRecords);
  // console.log("valids", valids.length);

  const prisma = new PrismaClient();
  const employees = await prisma.employee.findMany({
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

  const upserts = newEmployeeRecords.map(async (r) => {
    try {
      const values = convertToCamelCase(r.values);

      let data: {
        organizationId: string;
        employeeId: string;
        managerId?: string;
        flatfileRecordId?: string;
      } = {
        organizationId: token.organizationId,
        employeeId: r.values.employeeId.value as string,
        flatfileRecordId: r.id,
      };

      if (r.values.managerId.value && r.values.managerId.value.length > 0) {
        // Does the manager record already exist?
        let manager = await prisma.employee.findUnique({
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

  res.redirect(`/employees?flash=success&message=${message}`);
}
