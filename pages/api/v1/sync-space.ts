import type { NextApiRequest, NextApiResponse } from "next";
import { prismaClient } from "../../../lib/prisma-client";
import {
  syncBenefitPlanRecords,
  syncWorkbookRecords,
} from "../../../lib/sync-records";
import { SpaceType, findSpace } from "../../../lib/space";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("/sync-space", req.body);

  const { userId, spaceId } = req.body;

  const user = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("No user found for userId", userId);
  }

  // TODO: This and the sync code does redunandant user/space look up work
  const space = await findSpace({ userId, flatfileSpaceId: spaceId });

  // Not awaiting for early response back to Flatfile server
  if (space.type === SpaceType.WorkbookUpload) {
    syncWorkbookRecords({
      userId: user.id,
      organizationId: user.organizationId,
      spaceType: space.type as SpaceType,
    });
  } else if (space.type === SpaceType.FileFeed) {
    // TODO
  } else if (space.type === SpaceType.Embed) {
    syncBenefitPlanRecords({
      userId: user.id,
      organizationId: user.organizationId,
      spaceType: space.type as SpaceType,
    });
  }
  // dynamic needs its own type
  // else if (space.type === SpaceType.WorkbookUpload) {
  // }

  res.status(200).json({ success: true });
}
