// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Space } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { SpaceRepo, SpaceType } from "../../../lib/space";
import { fetchFileFromDrive } from "../../../lib/google-drive";
import {
  FlatfileSpaceData,
  WorkflowType,
  addGuestToSpace,
  createSpace,
  postFile,
} from "../../../lib/flatfile";
import { prismaClient } from "../../../lib/prisma-client";
import { SupportedLanguage } from "../../../components/language-context";

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
  const environmentId =
    (process.env.FLATFILE_ENVIRONMENT_ID as string) ||
    (process.env.FILEFEED_ENVIRONMENT_ID as string);

  const language = req.body.language as SupportedLanguage;
  if (!language) {
    throw new Error("Missing language query param");
  }
  const spaceResult = await createSpace({
    workflow,
    userId: user.id,
    environmentId,
    spaceName: "Filefeed",
    language,
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
  const space = await SpaceRepo.createSpace({
    userId: user.id,
    type: SpaceType.FileFeed,
    flatfileData: spaceResult,
  });

  const file = await fetchFileFromDrive();

  const spaceId = space.flatfileSpaceId;

  await postFile({
    workflow,
    environmentId,
    spaceId,
    file,
  });

  res.redirect("/file-feed?flash=success&message=Setup Flatfile!");
}
