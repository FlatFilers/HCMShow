// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import {
  getAccessToken,
  getRecords,
  validRecords,
} from "../../../lib/flatfile";
import { upsertEmployee } from "../../../lib/employee";

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

  console.log("Get records", records);

  const prisma = new PrismaClient();
  const employees = await prisma.employee.findMany({
    where: {
      organizationId: token.organizationId,
    },
    select: {
      employeeId: true,
    },
  });

  console.log("employees", employees);

  const employeeIds = employees.map((e) => e.employeeId);

  // console.log("employeeIds", employeeIds);

  // console.log("rec", records[0].values);
  // console.log("valid recs", validRecords(records));

  const newEmployeeRecords = validRecords(records).filter((r) => {
    return !employeeIds.includes(r.id) && r.values.employeeId.value;
  });

  console.log("newrecs", newEmployeeRecords);

  const upserts = newEmployeeRecords.map(async (r) => {
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
  });

  await Promise.all(upserts);

  res.redirect("/imports");
}
