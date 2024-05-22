import type { NextApiRequest, NextApiResponse } from "next";
import { isNotAuthorized } from "../../../../lib/api-utils";
import { WorkflowType } from "../../../../lib/flatfile";
import { SpaceType, getSpaceForFlatfileSpaceId } from "../../../../lib/space";
import { syncBenefitPlanRecords } from "../../../../lib/sync-records";
import { ActionType } from "../../../../lib/action";
import { prismaClient } from "../../../../lib/prisma-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (isNotAuthorized({ req })) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { flatfileSpaceId } = req.query as { flatfileSpaceId: string };

  const space = await getSpaceForFlatfileSpaceId(flatfileSpaceId);
  const userId = space.userId;

  const user = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error(`No user found for userId ${userId}`);
  }

  const { syncedFlatfileRecordIds } = await syncBenefitPlanRecords({
    workflow: WorkflowType.FileFeed,
    userId: userId,
    organizationId: user.organizationId,
    spaceType: space.type as SpaceType,
    actionType: ActionType.SyncFilefeedRecords,
  });

  res.status(200).json({
    success: true,
    syncedFlatfileRecordIds,
  });

  return;
}
