// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { SpaceRepo, SpaceType } from "../../../lib/space";
import {
  WorkflowType,
  createSpace,
  createWorkbookForSpace,
  updateSpaceWorkbookId,
} from "../../../lib/flatfile";
import { prismaClient } from "../../../lib/prisma-client";
import { SupportedLanguage } from "../../../components/language-context";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({
    req: req,
  });

  if (!token || !token.sub) {
    console.log("No session");
    return {
      notFound: true,
    };
  }

  const user = await prismaClient.user.findUnique({
    where: {
      id: token.sub,
    },
  });

  if (!user) {
    throw new Error("No user found");
  }

  console.log("here");

  const workflow = WorkflowType.Dynamic;
  const environmentId = process.env.DYNAMIC_TEMPLATES_ENVIRONMENT_ID as string;

  const language = req.body.language as SupportedLanguage;
  if (!language) {
    throw new Error("Missing language query param");
  }

  const workbookConfig = req.body.workbook;
  if (!workbookConfig) {
    throw new Error("Missing workbookConfig param");
  }

  console.log("workbookConfig", workbookConfig);

  console.log("user", user.id);

  const spaceResult = await createSpace({
    workflow,
    userId: user.id,
    environmentId,
    spaceName: "Dynamic",
    language,
  });

  console.log("spaceResult", spaceResult);

  if (!spaceResult) {
    console.log("bad");
    res.status(400).json({
      error: "Error setting up Flatfile",
    });
    return;
  }

  const workbook = await createWorkbookForSpace({
    workflow,
    flatfileSpaceId: spaceResult.id,
    workbookConfig,
  });

  if (!workbook) {
    console.log("bad");
    res.status(400).json({
      error: "Error setting up Flatfile workbook",
    });
    return;
  }

  await updateSpaceWorkbookId({
    workflow,
    flatfileSpaceId: spaceResult.id,
    workbookId: workbook.id,
  });

  const space = await SpaceRepo.createSpace({
    userId: user.id,
    type: SpaceType.Dynamic,
    flatfileData: spaceResult,
  });

  res.status(200).json({ spaceId: spaceResult.id });
  return;
}
