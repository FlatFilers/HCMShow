import type { NextApiRequest, NextApiResponse } from "next";
import { prismaClient } from "../../../lib/prisma-client";
import { syncWorkbookRecords } from "../../../lib/sync-records";
import { SpaceType, getSpaceForFlatfileSpaceId } from "../../../lib/space";
import { ActionState, ActionType, createAction } from "../../../lib/action";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("/sync-file-feed", req.body);

  const { spaceId } = req.body;

  console.log("spaceId", spaceId);

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
    description: "",
    metadata: {
      state: ActionState.Initial,
    },
  });

  // Not awaiting for early response back to Flatfile server
  syncWorkbookRecords({
    userId: user.id,
    organizationId: user.organizationId,
    spaceType: space.type as SpaceType,
  }).then(() => {
    console.log("Filefeed: syncWorkbookRecords complete");

    prismaClient.action.update({
      where: {
        id: action.id,
      },
      data: {
        metadata: {
          state: "complete",
          description: "Synced X Records",
        },
      },
    });
  });

  res.status(200).json({ name: "John Doe" });
}