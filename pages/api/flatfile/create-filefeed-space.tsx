// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Space } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { createSpace, getAccessToken } from "../../../lib/flatfile";

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

  const accessToken = await getAccessToken();

  const flatfileSpaceData = await createSpace(accessToken);

  // TODO: Add space type here
  const space: Space = await prisma.space.create({
    data: {
      userId: user.id,
      flatfileData: flatfileSpaceData as unknown as Prisma.InputJsonValue,
    },
  });

  // console.log("space", space);
  // console.log("space data", space.flatfileData);

  res.redirect("/file-feed?flash=success&message=Setup Flatfile!");
}
