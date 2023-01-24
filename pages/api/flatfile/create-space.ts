// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { AddSpaceRequest, SpaceConfig } from "@flatfile/api";
import { Prisma, PrismaClient, Space, User } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import {
  FlatfileSpaceData,
  addGuestToSpace,
  createSpace,
  getAccessToken,
  getSpace,
} from "../../../lib/flatfile";

type Data = {
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const token = await getToken({
    req: req,
  });
  // console.log("gSSP token", token);

  if (!token) {
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

  await addGuestToSpace(user, flatfileSpaceData, accessToken);

  const flatfileSpaceDataRefetch = await getSpace(
    flatfileSpaceData.id,
    accessToken
  );

  const space: Space = await prisma.space.create({
    data: {
      userId: user.id,
      flatfileData:
        flatfileSpaceDataRefetch as unknown as Prisma.InputJsonValue,
    },
  });

  // console.log("space", space);
  // console.log("space data", space.flatfileData);

  res.redirect("/onboarding");
}
