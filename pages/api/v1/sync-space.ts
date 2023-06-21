import type { NextApiRequest, NextApiResponse } from "next";
import { prismaClient } from "../../../lib/prisma-client";
import {
  syncBenefitPlanRecords,
  syncWorkbookRecords,
} from "../../../lib/sync-records";
import { SpaceType, findSpace, findSpaceForEmbed } from "../../../lib/space";
import { WorkflowType } from "../../../lib/flatfile";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("/sync-space", req.body);

  const { userId, spaceId, workflowType } = req.body;

  const user = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("No user found for userId", userId);
  }

  let space;

  // TODO: React package can't re-use a space, so the spaceId we get here is different every time.
  // So we have to look up the space in a hacky way.
  if (workflowType && workflowType === "embed") {
    space = await findSpaceForEmbed({ userId });

    if (!space) {
      throw new Error("No embed space found for userId", userId);
    }
  } else {
    // TODO: This and the sync code does redunandant user/space look up work
    space = await findSpace({ userId, flatfileSpaceId: spaceId });
  }

  // Not awaiting for early response back to Flatfile server
  if (space.type === SpaceType.WorkbookUpload) {
    syncWorkbookRecords({
      workflow: WorkflowType.Onboarding,
      userId: user.id,
      organizationId: user.organizationId,
      spaceType: space.type as SpaceType,
    });
  } else if (space.type === SpaceType.FileFeed) {
    syncBenefitPlanRecords({
      workflow: WorkflowType.FileFeed,
      userId: user.id,
      organizationId: user.organizationId,
      spaceType: space.type,
    });
  } else if (space.type === SpaceType.Embed) {
    syncBenefitPlanRecords({
      workflow: WorkflowType.Embedded,
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
