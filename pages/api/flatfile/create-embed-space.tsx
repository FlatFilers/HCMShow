// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Space } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import {
  addDocumentToSpace,
  createSpace,
  getAccessToken,
  getSpace,
} from "../../../lib/flatfile";
import { SpaceType } from "../../../lib/space";

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

  const accessToken = await getAccessToken({
    clientId: process.env.EMBEDDED_CLIENT_ID as string,
    secret: process.env.EMBEDDED_CLIENT_SECRET as string,
  });

  const flatfileSpaceData = await createSpace({
    accessToken,
    spaceConfigId: process.env.EMBEDDED_SPACE_CONFIG_ID as string,
    environmentId: process.env.EMBEDDED_ENVIRONMENT_ID as string,
    userId,
  });

  console.log("flatfileSpaceData", flatfileSpaceData);

  const flatfileSpaceDataRefetch = await getSpace(
    flatfileSpaceData.id,
    accessToken
  );

  const space: Space = await prisma.space.create({
    data: {
      userId,
      flatfileData:
        flatfileSpaceDataRefetch as unknown as Prisma.InputJsonValue,
      type: SpaceType.Embed,
    },
  });

  // console.log("space", space);
  // console.log("space data", flatfileSpaceData);

  const initialDocumentBody = `<div> 
  <h1 style="margin-bottom: 0px;">Welcome! Let's import your data.</h1>
  <p style="margin-top: 0px; margin-bottom: 12px;">Follow the steps below in order. Note: you can always return to this page by clicking "Welcome" in the left-hand sidebar.</p>
  <h2 style="margin-bottom: 0px;">1. Visit Files</h2>
  <p style="margin-top: 0px; margin-bottom: 8px;">Click "Files" in the left-hand sidebar. This is where you can upload files you want to import into Flatfile.</p>
  <h2 style="margin-bottom: 0px;">2. Upload the sample data</h2>
  <p style="margin-top: 0px; margin-bottom: 8px;">On the Files page, click "Add files" or drag-and-drop the sample data you downloaded previously onto the page.</p>
  <p style="margin-top: 0px; margin-bottom: 8px;">
  <div style="font-weight: 600">Note:</div> There are multiple tabs in the sample data. Be sure to
  upload data from each tab.</p>
  <p style="margin-top: 0px; margin-bottom: 8px;">After the file uploads, click "Import" and follow the steps to completion to import the workbook.</p>
  <h2 style="margin-bottom: 0px;">3. Return to HCM.show</h2>
  <p style="margin-top: 0px; margin-bottom: 12px;">After uploading and importing the sample data, click the button below to return to HCM.show and click "Sync Records" to sync the data back into HCM.show.</p>
</div>`;

  const addDocumentToSpaceResponse = await addDocumentToSpace(
    "Welcome",
    initialDocumentBody,
    flatfileSpaceData.id,
    accessToken
  );

  res.redirect(
    `/embedded-portal?flash=success&message=Space Created!&createdSpaceId=${flatfileSpaceData.id}`
  );
}
