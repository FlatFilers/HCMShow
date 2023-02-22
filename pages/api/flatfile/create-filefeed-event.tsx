// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Space } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import {
  addDocumentToSpace,
  addGuestToSpace,
  createSpace,
  getAccessToken,
  getSpace,
} from "../../../lib/flatfile";
import { ActionType, createAction } from "../../../lib/action";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({
    req: req,
  });
  // console.log("gSSP token", token);

  if (!token || !token.sub) {
    console.log("No session");
    return {
      notFound: true,
    };
  }

  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({
    where: {
      id: token.sub,
    },
  });

  if (!user) {
    throw new Error("No user found");
  }

  await createAction({
    userId: token.sub,
    organizationId: token.organizationId,
    type: ActionType.FileFeedEvent,
    description: "",
    metadata: {
      state: "initial",
    },
  });

  res.redirect(`/file-feed?flash=success&message=New file event found`);
}
