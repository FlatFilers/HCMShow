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
  inviteGuestToSpace,
} from "../../../lib/flatfile";

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

  const accessToken = await getAccessToken();

  const flatfileSpaceData = await createSpace(accessToken);
  const spaceId = flatfileSpaceData.id;

  const addGuestToSpaceResponse = await addGuestToSpace(user, flatfileSpaceData, accessToken);

  const flatfileSpaceDataRefetch = await getSpace(
    flatfileSpaceData.id,
    accessToken
  );

  const inviteGuestsToSpaceResponse = await inviteGuestToSpace(addGuestToSpaceResponse[0].id, spaceId, accessToken);

  // console.log('inviteGuestsToSpaceResponse', inviteGuestsToSpaceResponse.success);

  const space: Space = await prisma.space.create({
    data: {
      userId: user.id,
      flatfileData:
        flatfileSpaceDataRefetch as unknown as Prisma.InputJsonValue,
    },
  });

  // console.log("space", space);
  // console.log("space data", space.flatfileData);

  const addDocumentToSpaceResponse = await addDocumentToSpace("Document title", "Document body", spaceId, accessToken);

  // console.log("addDocumentToSpaceResponse", addDocumentToSpaceResponse);

  res.redirect("/onboarding?message=Created space");
}
