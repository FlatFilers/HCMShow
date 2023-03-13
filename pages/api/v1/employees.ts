import { prismaClient } from "../../../lib/prisma-client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSpaceForFlatfileSpaceId } from "../../../lib/space";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const spaceId = req.query.spaceId as string;

  const space = await getSpaceForFlatfileSpaceId(spaceId);

  const user = await prismaClient.user.findUnique({
    where: {
      id: space.userId,
    },
  });

  if (!user) {
    throw new Error(`No user found for space ${spaceId}`);
  }

  const employees = await prismaClient.employee.findMany({
    where: {
      organizationId: user.organizationId,
    },
    select: { employeeId: true },
  });

  const result = employees.map((e) => e.employeeId);

  res.send(result);
}
