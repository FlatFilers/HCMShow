// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { findSpace } from "../../../lib/space";
import { WorkflowType, updateSpaceLanguage } from "../../../lib/flatfile";
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

  const { workflow, flatfileSpaceId, language } = req.query;

  if (!workflow || !flatfileSpaceId || !language) {
    console.error("Missing workflow, flatfileSpaceId, or language");
    return res.status(400).json({
      error: "Missing workflow, flatfileSpaceId, or language",
    });
  }

  const dbSpace = await findSpace({
    userId: token.sub as string,
    flatfileSpaceId: flatfileSpaceId as string,
  });

  if (!dbSpace) {
    console.error(
      `Space not found for user ${token.sub} and flatfileSpaceId ${flatfileSpaceId}`
    );
    return res.status(400).json({
      error: `Space not found for user ${token.sub} and flatfileSpaceId ${flatfileSpaceId}`,
    });
  }

  await updateSpaceLanguage({
    workflow: workflow as WorkflowType,
    flatfileSpaceId: flatfileSpaceId as string,
    language: language as SupportedLanguage,
  });

  res.status(200).json({ success: true });
}
