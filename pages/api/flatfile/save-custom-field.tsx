// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { prismaClient } from "../../../lib/prisma-client";

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

  const prisma = prismaClient;

  // find and update action from the req body
  const customField = await prisma.customField.create({
    data: {
      name: req.body.name,
      type: req.body.type,
      required: req.body.required,
      dateFormat: req.body.dateFormat,
      decimals: req.body.decimals,
      enumOptions: req.body.enumOptions,
      user: { connect: { id: token.sub } },
    },
  });

  // console.log("customField", customField);

  res.send(customField);
}
