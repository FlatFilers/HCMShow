// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { syncWorkbookRecords } from "../../../lib/sync-records";
import { SpaceType } from "../../../lib/space";

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

  const pageToSpaceType = {
    embedded: "Embed",
    workbook_upload: "WorkbookUpload",
  };

  let spaceTypeKey =
    pageToSpaceType[req.body.page as keyof typeof pageToSpaceType];

  const { success, message } = await syncWorkbookRecords({
    userId: token.sub,
    organizationId: token.organizationId,
    spaceType: SpaceType[spaceTypeKey as keyof typeof SpaceType],
  });
  const flash = success ? "success" : "error";

  res.redirect(`/${req.body.page}?flash=${flash}&message=${message}`);
}
