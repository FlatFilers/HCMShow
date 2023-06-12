// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Space } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { FlatfileSpaceData } from "../../../lib/flatfile-legacy";
import { SpaceType } from "../../../lib/space";
import { fetchFileFromDrive } from "../../../lib/google-drive";
import {
  WorkflowType,
  addGuestToSpace,
  createSpace,
  postFile,
} from "../../../lib/flatfile";
import { prismaClient } from "../../../lib/prisma-client";

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

  const user = await prismaClient.user.findUnique({
    where: {
      id: token.sub,
    },
  });

  if (!user) {
    throw new Error("No user found");
  }

  const workflow = WorkflowType.FileFeed;
  const environmentId = process.env.FILEFEED_ENVIRONMENT_ID as string;

  const spaceResult = await createSpace({
    workflow,
    userId: user.id,
    environmentId,
    spaceName: "Filefeed",
  });

  if (!spaceResult) {
    return res.redirect(
      "/file-feed?flash=error&message=Error setting up Flatfile"
    );
  }

  const guestResult = await addGuestToSpace({
    workflow,
    environmentId,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    spaceId: spaceResult.id,
  });

  if (!guestResult) {
    res.redirect("/file-feed?flash=error&message=Error setting up Flatfile");
  }

  const space: Space = await prismaClient.space.create({
    data: {
      userId: user.id,
      type: SpaceType.FileFeed,
      flatfileData: spaceResult as unknown as Prisma.InputJsonValue,
    },
  });

  const file = await fetchFileFromDrive();

  const spaceId = (space.flatfileData as unknown as FlatfileSpaceData).id;
  await postFile({
    workflow,
    environmentId,
    spaceId,
    file,
  });

  res.redirect("/file-feed?flash=success&message=Setup Flatfile!");
}
