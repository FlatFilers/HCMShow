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

  const mappedRecords = await mapRecordFieldsForEmployee(records);

  console.log("mappedRecords", mappedRecords);

  // TODO: Do a flash alert and return if there's no records in FF yet
  // console.log("Get records", records);

  // throw "hi";
  const valids = await validRecords(mappedRecords);

  console.log("valids", valids.length);

  // const prisma = new PrismaClient();
  // const employees = await prisma.employee.findMany({
  //   where: {
  //     organizationId: token.organizationId,
  //   },
  //   select: {
  //     employeeId: true,
  //   },
  // });

  // console.log("employees", employees);

  // const employeeIds = employees.map((e) => e.employeeId);

  // const vRecords = await validRecords(records);
  // console.log("vrecords", vRecords);
  // const newEmployeeRecords = vRecords.filter((r) => {
  //   return !employeeIds.includes(r.id) && r.values.employeeId.value;
  // });
  // .map((r) => {
  //   console.log("r", r);
  //   console.log("val", convertToCamelCase(r.values));
  //   return { id: r.id, values: convertToCamelCase(r.values) };
  // });

  // console.log("new emp", newEmployeeRecords);

  // console.log("newrecs", newEmployeeRecords);

  // const upserts = newEmployeeRecords.map(async (r) => {
  //   try {
  //     const values = convertToCamelCase(r.values);

  //     let data: {
  //       organizationId: string;
  //       employeeId: string;
  //       managerId?: string;
  //       flatfileRecordId?: string;
  //     } = {
  //       organizationId: token.organizationId,
  //       employeeId: r.values.employeeId.value as string,
  //       flatfileRecordId: r.id,
  //     };

  //     if (r.values.managerId.value && r.values.managerId.value.length > 0) {
  //       // Does the manager record already exist?
  //       let manager = await prisma.employee.findUnique({
  //         where: {
  //           employeeId: r.values.managerId.value,
  //         },
  //       });

  //       if (!manager) {
  //         manager = await upsertEmployee({
  //           ...data,
  //           employeeId: r.values.managerId.value,
  //           managerId: undefined,
  //         });
  //       }

  //       data = { ...data, managerId: manager.id };
  //     }

  //     await upsertEmployee(data);
  //   } catch (error) {
  //     console.error(
  //       `Error: syncing record for user ${token.sub}, record ${r.id}`
  //     );
  //   }
  // });

  // await Promise.all(upserts);

  // await createAction({
  //   userId: token.sub,
  //   organizationId: token.organizationId,
  //   type: ActionType.SyncRecords,
  //   description: `Found ${records.length} records. Synced ${newEmployeeRecords.length} new Employee records.`,
  // });

  // res.redirect("/employees?message=Synced records");
  res.redirect("/onboarding?message=Synced records");
}

const convertToCamelCase = (obj: { [key: string]: any }) => {
  const newObj: { [key: string]: any } = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = key.replace(/_([a-z])/g, (match) =>
        match[1].toUpperCase()
      );
      newObj[newKey] = obj[key];
    }
  }
  return newObj;
};
