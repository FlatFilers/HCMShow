// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Space } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import {
  FlatfileSpaceData,
  addGuestToSpace,
  createSpace,
  getAccessToken,
  getSpace,
  postFile,
} from "../../../lib/flatfile";
import { SpaceType } from "../../../lib/space";
import { fetchFileFromDrive } from "../../../lib/google-drive";

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

  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({
    where: {
      id: token.sub,
    },
  });

  if (!user) {
    throw new Error("No user found");
  }

  const accessToken = await getAccessToken(
    process.env.FILEFEED_CLIENT_ID as string,
    process.env.FILEFEED_CLIENT_SECRET as string
  );

  const environmentId = process.env.FILEFEED_ENVIRONMENT_ID as string;

  const flatfileSpaceData = await createSpace({
    accessToken,
    spaceConfigId: process.env.FILEFEED_SPACE_CONFIG_ID as string,
    environmentId,
  });

  const addGuestToSpaceResponse = await addGuestToSpace(
    user,
    flatfileSpaceData,
    accessToken,
    environmentId
  );

  console.log("addGuestToSpaceResponse", addGuestToSpaceResponse);

  if (
    addGuestToSpaceResponse.errors &&
    addGuestToSpaceResponse.errors[0].message
  ) {
    res.redirect("/file-feed?flash=error&message=Error setting up Flatfile");
  }

  const flatfileSpaceDataRefetch = await getSpace(
    flatfileSpaceData.id,
    accessToken
  );

  console.log("flatfileSpaceDataRefetch", flatfileSpaceDataRefetch);

  // TODO: Don't need this, already sending an email on create?
  // const inviteGuestsToSpaceResponse = await inviteGuestToSpace(
  //   addGuestToSpaceResponse[0].id,
  //   spaceId,
  //   accessToken
  // );

  // console.log('inviteGuestsToSpaceResponse', inviteGuestsToSpaceResponse.success);

  const space: Space = await prisma.space.create({
    data: {
      userId: user.id,
      type: SpaceType.FileFeed,
      flatfileData:
        flatfileSpaceDataRefetch as unknown as Prisma.InputJsonValue,
    },
  });

  const file = await fetchFileFromDrive();

  const spaceId = (space.flatfileData as unknown as FlatfileSpaceData).id;
  await postFile(accessToken, spaceId, file);

  res.redirect("/file-feed?flash=success&message=Setup Flatfile!");
}
