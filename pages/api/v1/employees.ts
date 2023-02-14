import { prismaClient } from "../../../lib/prisma-client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const employees = await prismaClient.employee.findMany({
    select: { employeeId: true },
  });

  const result = employees.map((e) => e.employeeId);

  res.send(result);
}
