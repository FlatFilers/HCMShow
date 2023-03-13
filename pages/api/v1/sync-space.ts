import type { NextApiRequest, NextApiResponse } from "next";
import { prismaClient } from "../../../lib/prisma-client";
import { syncWorkbookRecords } from "../../../lib/sync-records";
import { SpaceType, getSpaceForFlatfileSpaceId } from "../../../lib/space";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("/sync-space", req.body);

  const { spaceId } = req.body;

  const space = await getSpaceForFlatfileSpaceId(spaceId);

  const user = await prismaClient.user.findUnique({
    where: {
      id: space.userId,
    },
  });

  if (!user) {
    throw new Error("No user found for space", spaceId);
  }

  // Not awaiting for early response back to Flatfile server
  syncWorkbookRecords({
    userId: user.id,
    organizationId: user.organizationId,
    spaceType: space.type as SpaceType,
  });

  res.status(200).json({ name: "John Doe" });
}
