// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Space } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { SpaceRepo, SpaceType } from "../../../lib/space";
import {
  WorkflowType,
  addGuestToSpace,
  createSpace,
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

  // TODO: add all the user properties to the jwt/session
  // and we don't have to do this query
  const user = await prisma.user.findUnique({
    where: {
      id: token.sub,
    },
  });

  if (!user) {
    throw new Error("No user found");
  }

  const environmentId = process.env.ONBOARDING_ENVIRONMENT_ID;

  if (!environmentId) {
    throw new Error("Missing ONBOARDING_ENVIRONMENT_ID env var");
  }

  const spaceResult = await createSpace({
    workflow: WorkflowType.Onboarding,
    userId: token.sub,
    environmentId,
    spaceName: "HCM.show Project Onboarding",
  });

  if (!spaceResult) {
    return res.redirect(
      "/project-onboarding?flash=error&message=An error happened setting up Flatfile."
    );
  }

  const guestResult = await addGuestToSpace({
    workflow: WorkflowType.Onboarding,
    environmentId,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    spaceId: spaceResult.id,
  });

  if (!guestResult) {
    return res.redirect(
      "/project-onboarding?flash=error&message=Error setting up Flatfile"
    );
  }

  await SpaceRepo.createSpace({
    userId: user.id,
    flatfileData: spaceResult,
    type: SpaceType.WorkbookUpload,
  });

  res.redirect("/project-onboarding?flash=success&message=Setup Flatfile!");
}
