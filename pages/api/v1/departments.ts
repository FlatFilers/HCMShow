import { prismaClient } from "../../../lib/prisma-client";
import type { NextApiRequest, NextApiResponse } from "next";
import { Department, PrismaClient } from "@prisma/client";
import { SerializeableDepartment } from "../../departments";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const serverAuthToken = req.headers["x-server-auth"];

  if (!serverAuthToken || serverAuthToken !== process.env.SERVER_AUTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const dbDepartment: Department[] = await prismaClient.department.findMany();

  const departments: SerializeableDepartment[] = dbDepartment.map(
    (department) => {
      return {
        id: department.id,
        departmentName: department.departmentName,
        departmentCode: department.departmentCode,
      };
    }
  );

  return res.status(200).json(departments);
}
