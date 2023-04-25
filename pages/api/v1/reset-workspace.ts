import type { NextApiRequest, NextApiResponse } from "next";
import { prismaClient } from "../../../lib/prisma-client";
import { getToken } from "next-auth/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("/reset-workspace", req.body);

  const token = await getToken({
    req: req,
  });
  // console.log("gSSP token", token);

  if (!token?.sub) {
    throw new Error("No session");
  }

  const deleteOptions = await prismaClient.options.deleteMany({
    where: {
      userId: token.sub,
    },
  });

  const deleteCustomFields = await prismaClient.customField.deleteMany({
    where: {
      userId: token.sub,
    },
  });

  res.status(200).json({ message: "Options and Custom Fields deleted" });
}
