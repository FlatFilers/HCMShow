// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { AddSpaceRequest, SpaceConfig } from "@flatfile/api";
import { PrismaClient, Space, User } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { getAccessToken, getRecords } from "../../../lib/flatfile";

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

  if (!token?.sub) {
    console.log("No session");
    return {
      notFound: true,
    };
  }

  const accessToken = await getAccessToken();

  const records = await getRecords(token.sub, accessToken);

  // todo
  res.redirect("/imports");
}
