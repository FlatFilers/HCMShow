import type { NextApiRequest, NextApiResponse } from "next";
import { prismaClient } from "../../../lib/prisma-client";
import { syncWorkbookRecords } from "../../../lib/sync-records";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("/sync-space", req.body);

  const { spaceId } = req.body;

  const spaces = await prismaClient.space.findMany({
    where: {
      flatfileData: {
        path: ["id"],
        equals: spaceId,
      },
    },
  });

  if (spaces.length > 1) {
    throw new Error("More than one space found for spaceId", spaceId);
  } else if (spaces.length === 0) {
    throw new Error("No space found for spaceId", spaceId);
  }

  const space = spaces[0];

  const user = await prismaClient.user.findUnique({
    where: {
      id: space.userId,
    },
  });

  if (!user) {
    throw new Error("No user found for space", spaceId);
  }

  // Not awaiting for early response back to Flatfile server
  syncWorkbookRecords({ userId: user.id, organizationId: user.organizationId });

  res.status(200).json({ name: "John Doe" });
}
