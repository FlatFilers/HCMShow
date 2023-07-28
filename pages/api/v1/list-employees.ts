import { prismaClient } from "../../../lib/prisma-client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.query.userId || Array.isArray(req.query.userId)) {
    res.status(400).send("Invalid or missing userId");
    return;
  }

  const userId = req.query.userId;

  const user = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error(`No user found for ID# ${userId}`);
  }

  const employees = await prismaClient.employee.findMany({
    where: {
      organizationId: user.organizationId,
    },
  });

  res.send(employees);
}
