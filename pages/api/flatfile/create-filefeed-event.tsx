// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { ActionState, ActionType, createAction } from "../../../lib/action";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({
    req: req,
  });

  if (!token || !token.sub) {
    console.log("No session");
    return {
      notFound: true,
    };
  }

  const action = await createAction({
    userId: token.sub,
    organizationId: token.organizationId,
    type: ActionType.FileFeedEvent,
    description: "",
    metadata: {
      state: ActionState.Initial,
    },
  });

  res.status(201).json(action);
}
