// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { prismaClient } from "../../../lib/prisma-client";
import { ActionType, getActions } from "../../../lib/action";
import { Action } from "@prisma/client";

export type GetFileFeedActionsResult = {
  actions: Action[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetFileFeedActionsResult>
) {
  const token = await getToken({
    req: req,
  });
  // console.log("gSSP token", token);

  if (!token?.sub) {
    throw new Error("No session");
  }

  const actions = await getActions(
    token.organizationId,
    ActionType.FileFeedEvent
  );
  res.send({ actions });
}
