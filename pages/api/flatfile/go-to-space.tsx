// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Space } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { SpaceType, findSpace } from "../../../lib/space";
import { WorkflowType, createSpace, getSpace } from "../../../lib/flatfile";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // TODO: This is duplicated logic
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

  // get the space id from the query params
  const { workflow, flatfileSpaceId } = req.query;

  if (!workflow || !flatfileSpaceId) {
    console.error("Missing workflow or flatfileSpaceId");
    return res.status(400).json({
      error: "Missing workflow or flatfileSpaceId",
    });
  }

  // Validate this user owns this space
  const dbSpace = await findSpace({
    userId: token.sub as string,
    flatfileSpaceId: flatfileSpaceId as string,
  });

  if (!dbSpace) {
    console.error(
      `Space not found for user ${token.sub} and flatfileSpaceId ${flatfileSpaceId}`
    );
    return res.status(400).json({
      error: `Space not found for user ${token.sub} and flatfileSpaceId ${flatfileSpaceId}`,
    });
  }

  // Query the space for a fresh guestLink
  const space = await getSpace({
    workflow: workflow as WorkflowType,
    spaceId: flatfileSpaceId as string,
  });

  if (!space) {
    console.error(
      `No space found for workflow ${workflow} and flatfileSpaceId ${flatfileSpaceId}`
    );
    return res.status(400).json({
      error: `No space found for workflow ${workflow} and flatfileSpaceId ${flatfileSpaceId}`,
    });
  }

  res.status(200).json({ guestLink: space.guestLink });
}
