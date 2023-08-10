import type { NextApiRequest, NextApiResponse } from "next";
import { prismaClient } from "../../../lib/prisma-client";
import {
  syncBenefitPlanRecords,
  syncWorkbookRecords,
} from "../../../lib/sync-records";
import { SpaceType, findSpace, findSpaceForType } from "../../../lib/space";
import { WorkflowType } from "../../../lib/flatfile";
import { ActionType } from "../../../lib/action";
import { isAuthorized } from "../../../lib/api-utils";

/**
 * @swagger
 * /sync-space:
 *   post:
 *     tags: [/api/v1/]
 *     summary: Syncs records from a space for a given workflow. Used in the primary "Submit" action for the workbook.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User identifier
 *               spaceId:
 *                 type: string
 *                 description: Space identifier
 *               workflowType:
 *                 type: string
 *                 description: Workflow type (onboarding, embedded, filefeed, dynamic)
 *             required:
 *               - userId
 *     responses:
 *       200:
 *         description: Sync completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Sync success status
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!isAuthorized({ req })) {
    return res.status(401).json({ error: "Unauthorized" });
  }
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
    space = await findSpaceForType({ userId, type: SpaceType.Embed });

    if (!space) {
      throw new Error("No embed space found for userId", userId);
    }
  } else if (workflowType && workflowType === "dynamic") {
    space = await findSpaceForType({ userId, type: SpaceType.Dynamic });

    if (!space) {
      throw new Error("No dynamic space found for userId", userId);
    }
  } else {
    // TODO: This and the sync code does redunandant user/space look up work
    space = await findSpace({ userId, flatfileSpaceId: spaceId });
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
    const { successfullySyncedFlatfileRecordIds } =
      await syncBenefitPlanRecords({
        workflow: WorkflowType.FileFeed,
        userId: user.id,
        organizationId: user.organizationId,
        spaceType: space.type,
        actionType: ActionType.SyncFilefeedRecords,
      });

    res.status(200).json({
      success: true,
      successfullySyncedFlatfileRecordIds,
    });
    return;
  } else if (space.type === SpaceType.Embed) {
    await syncBenefitPlanRecords({
      workflow: WorkflowType.Embedded,
      userId: user.id,
      organizationId: user.organizationId,
      spaceType: space.type as SpaceType,
      actionType: ActionType.SyncEmbedRecords,
      spaceId: spaceId,
    });
  } else if (space.type === SpaceType.Dynamic) {
    await syncBenefitPlanRecords({
      workflow: WorkflowType.Dynamic,
      userId: user.id,
      organizationId: user.organizationId,
      spaceType: space.type as SpaceType,
      actionType: ActionType.SyncDynamicRecords,
      spaceId: spaceId,
    });
  } else {
    throw new Error(
      `/sync-space: no space found for userId ${userId}, spaceId ${spaceId}, workflowType ${space.type}.`
    );
  }

  res.status(200).json({ success: true });
}
