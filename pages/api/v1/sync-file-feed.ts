import type { NextApiRequest, NextApiResponse } from "next";
import { prismaClient } from "../../../lib/prisma-client";
import { syncWorkbookRecords } from "../../../lib/sync-records";
import { SpaceType, getSpaceForFlatfileSpaceId } from "../../../lib/space";
import { ActionState, ActionType, createAction } from "../../../lib/action";

/**
 * @swagger
 * /sync-file-feed:
 *   post:
 *     tags: [/api/v1/]
 *     summary: Stores the event that occurred in the Flatfile space for the filefeed workflow.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               spaceId:
 *                 type: string
 *                 description: Space identifier
 *               topic:
 *                 type: string
 *                 description: Topic
 *             required:
 *               - spaceId
 *               - topic
 *     responses:
 *       200:
 *         description: Sync completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Response message
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
  console.log("/sync-file-feed", req.body);

  const { spaceId, topic } = req.body;

  console.log("spaceId", spaceId);
  console.log("topic", topic);

  // TODO: Once we get lookup userId in listener config and pass it here,
  // this should use `findSpace` like in /sync-space
  const space = await getSpaceForFlatfileSpaceId(spaceId);

  const user = await prismaClient.user.findUnique({
    where: {
      id: space.userId,
    },
  });

  if (!user) {
    throw new Error("No user found for space", spaceId);
  }

  const action = await createAction({
    userId: user.id,
    organizationId: user.organizationId,
    type: ActionType.FileFeedEvent,
    description: topic,
    metadata: {
      topic,
    },
  });

  // Not awaiting for early response back to Flatfile server
  // TODO: Make sync work for filefeed ENV vars
  // syncWorkbookRecords({
  //   userId: user.id,
  //   organizationId: user.organizationId,
  //   spaceType: space.type as SpaceType,
  // }).then(() => {
  //   console.log("Filefeed: syncWorkbookRecords complete");

  // prismaClient.action.update({
  //   where: {
  //     id: action.id,
  //   },
  //   data: {
  //     metadata: {
  //       state: "complete",
  //       description: "Synced X Records",
  //     },
  //   },
  // });
  // });

  res.status(200).json({ message: "success" });
}
