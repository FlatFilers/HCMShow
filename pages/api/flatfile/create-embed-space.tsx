// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { SpaceRepo, SpaceType } from "../../../lib/space";
import { WorkflowType, createSpace } from "../../../lib/flatfile";
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

  const userId = token.sub;

  const environmentId =
    process.env.FLATFILE_ENVIRONMENT_ID || process.env.EMBEDDED_ENVIRONMENT_ID;

  if (!environmentId) {
    throw new Error("Missing EMBEDDED_ENVIRONMENT_ID env var");
  }

  const language = req.body.language as SupportedLanguage;
  if (!language) {
    throw new Error("Missing language query param");
  }

  const flatfileSpaceData = await createSpace({
    workflow: WorkflowType.Embedded,
    userId,
    environmentId,
    spaceName: "HCM.show Embedded",
    language,
  });

  if (!flatfileSpaceData) {
    throw new Error("Failed to create space");
  }

  await SpaceRepo.createSpace({
    userId,
    flatfileData: flatfileSpaceData,
    type: SpaceType.Embed,
  });

  res.redirect(
    `/embedded-portal?flash=success&message=Space Created!&createdSpaceId=${
      flatfileSpaceData!.id
    }`
  );
}
