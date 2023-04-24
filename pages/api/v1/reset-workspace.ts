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

  const prisma = prismaClient;

  const deleteOptions = await prisma.options.deleteMany({
    where: {
      userId: token.sub,
    },
  });

  const deleteCustomFields = await prisma.customField.deleteMany({
    where: {
      userId: token.sub,
    },
  });

  res.send("Options and Custom Fields deleted");
}
