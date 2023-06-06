// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { FlatfileSpaceData } from "../../../../lib/flatfile";
import { prismaClient } from "../../../../lib/prisma-client";
import { SpaceType } from "../../../../lib/space";
import { Space } from "@prisma/client";
import { fetchFileFromDrive } from "../../../../lib/google-drive";
import { postFile } from "../../../../lib/new-flatfile";

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

  const space = (await prismaClient.space.findUnique({
    where: {
      userId_type: {
        userId: token.sub,
        type: SpaceType.FileFeed,
      },
    },
  })) as Space;

  // Post to flatfile api
  const spaceId = (space.flatfileData as unknown as FlatfileSpaceData).id;
  const environmentId = process.env.FILEFEED_ENVIRONMENT_ID as string;
  const file = await fetchFileFromDrive();

  await postFile({ flowName: "filefeed", spaceId, environmentId, file });

  res.status(200);
}
