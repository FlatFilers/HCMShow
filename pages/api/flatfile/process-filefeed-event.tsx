// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

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

  // find and update action from the req body
  const action = await prisma.action.update({
    where: {
      userId: token.sub,
      id: req.body.actionId,
    },
    data: {
      metadata: {
        state: "complete",
        description: "Synced X Records",
      },
    },
  });

  res.send({ data: action });
}
