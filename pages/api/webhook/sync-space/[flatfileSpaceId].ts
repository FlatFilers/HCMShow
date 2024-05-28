import type { NextApiRequest, NextApiResponse } from "next";
import { isNotAuthorized } from "../../../../lib/api-utils";
import { WorkflowType } from "../../../../lib/flatfile";
import { SpaceType, getSpaceForFlatfileSpaceId } from "../../../../lib/space";
import {
  syncBenefitPlanRecords,
  syncWorkbookRecords,
} from "../../../../lib/sync-records";
import { ActionType } from "../../../../lib/action";
import { prismaClient } from "../../../../lib/prisma-client";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (isNotAuthorized({ req })) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  console.log("/sync-space", req.body);

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

  if (space.type === SpaceType.WorkbookUpload) {
    await syncWorkbookRecords({
      workflow: WorkflowType.Onboarding,
      userId: user.id,
      organizationId: user.organizationId,
      spaceType: space.type as SpaceType,
      actionType: ActionType.SyncOnboardingRecords,
    });
  } else if (space.type === SpaceType.FileFeed) {
    const { syncedFlatfileRecordIds } = await syncBenefitPlanRecords({
      workflow: WorkflowType.FileFeed,
      userId: user.id,
      organizationId: user.organizationId,
      spaceType: space.type,
      actionType: ActionType.SyncFilefeedRecords,
    });

    res.status(200).json({
      success: true,
      syncedFlatfileRecordIds,
    });
    return;
  } else if (space.type === SpaceType.Embed) {
    await syncBenefitPlanRecords({
      workflow: WorkflowType.Embedded,
      userId: user.id,
      organizationId: user.organizationId,
      spaceType: space.type as SpaceType,
      actionType: ActionType.SyncEmbedRecords,
      spaceId: flatfileSpaceId,
    });
  } else if (space.type === SpaceType.Dynamic) {
    await syncBenefitPlanRecords({
      workflow: WorkflowType.Dynamic,
      userId: user.id,
      organizationId: user.organizationId,
      spaceType: space.type as SpaceType,
      actionType: ActionType.SyncDynamicRecords,
      spaceId: flatfileSpaceId,
    });
  } else {
    throw new Error(
      `/sync-space: no space found for userId ${userId}, spaceId ${space.id}, workflowType ${space.type}.`
    );
  }

  res.status(200).json({ success: true });
}
