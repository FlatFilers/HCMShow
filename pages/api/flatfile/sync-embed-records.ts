// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { syncBenefitPlanRecords } from "../../../lib/sync-records";
import { SpaceType } from "../../../lib/space";
import { useRouter } from "next/router";
import { workflowItems } from "../../../components/sidebar-layout";
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

  const { success, message } = await syncBenefitPlanRecords({
    workflow: WorkflowType.Embedded,
    userId: token.sub,
    organizationId: token.organizationId,
    spaceType: SpaceType.Embed,
    actionType: ActionType.SyncEmbedRecords,
  });
  const flash = success ? "success" : "error";

  const router = useRouter();

  const embeddedItem = workflowItems(router).find(
    (i) => i.slug === "embedded-portal"
  )!;

  res.redirect(`${embeddedItem.href}?flash=${flash}&message=${message}`);
}
