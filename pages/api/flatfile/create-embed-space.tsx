// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Space } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { SpaceType } from "../../../lib/space";
import { WorkflowType, createSpace } from "../../../lib/flatfile";

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

  const userId = token.sub;

  const environmentId = process.env.EMBEDDED_ENVIRONMENT_ID;

  if (!environmentId) {
    throw new Error("Missing EMBEDDED_ENVIRONMENT_ID env var");
  }

  const flatfileSpaceData = await createSpace({
    workflow: WorkflowType.Embedded,
    userId,
    environmentId,
    spaceName: "HCM.show Embedded",
  });

  console.log("flatfileSpaceData", flatfileSpaceData);

  const space: Space = await prisma.space.create({
    data: {
      userId,
      flatfileData: flatfileSpaceData as unknown as Prisma.InputJsonValue,
      type: SpaceType.Embed,
    },
  });

  // console.log("space", space);
  // console.log("space data", flatfileSpaceData);

  res.redirect(
    `/embedded-portal?flash=success&message=Space Created!&createdSpaceId=${
      flatfileSpaceData!.id
    }`
  );
}
