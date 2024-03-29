// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { syncWorkbookRecords } from "../../../lib/sync-records";
import { SpaceType } from "../../../lib/space";
import { WorkflowType } from "../../../lib/flatfile";
import { ActionType } from "../../../lib/action";

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
    throw new Error("No session");
  }

  const { success, message } = await syncWorkbookRecords({
    workflow: WorkflowType.Onboarding,
    userId: token.sub,
    organizationId: token.organizationId,
    spaceType: SpaceType.WorkbookUpload,
    actionType: ActionType.SyncOnboardingRecords,
  });
  const flash = success ? "success" : "error";

  res.redirect(`/project-onboarding?flash=${flash}&message=${message}`);
}
