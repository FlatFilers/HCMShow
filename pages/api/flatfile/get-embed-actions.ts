// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { prismaClient } from "../../../lib/prisma-client";
import { ActionType, getActions } from "../../../lib/action";
import { Action, Prisma } from "@prisma/client";
import { DateTime } from "luxon";

export type GetFileFeedActionsResult = {
  actions: Action[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetFileFeedActionsResult>
) {
  // console.log("/get-file-feed-actions", req.query);

  const token = await getToken({
    req: req,
  });

  if (!token?.sub) {
    throw new Error("No session");
  }

  const { afterTimestamp } = req.query;

  // Query actions who haven't been seen yet
  const actions = await prismaClient.action.findMany({
    where: {
      organizationId: token.organizationId,
      type: ActionType.SyncEmbedRecords,
      createdAt: {
        gt: afterTimestamp
          ? new Date(afterTimestamp as string)
          : DateTime.now().toUTC().toJSDate(),
      },
      metadata: {
        path: ["seen"],
        equals: false,
      } as Prisma.JsonFilter,
    },
  });

  const actionIds = actions.map((a) => a.id);

  // Mark them all as seen
  await prismaClient.action.updateMany({
    where: {
      id: {
        in: actionIds,
      },
    },
    data: {
      metadata: {
        seen: true,
      },
    },
  });

  res.send({ actions });
}
