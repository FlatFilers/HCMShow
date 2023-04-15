// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Space } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import {
  addDocumentToSpace,
  addGuestToSpace,
  createSpace,
  getAccessToken,
  getSpace,
  inviteGuestToSpace,
} from "../../../lib/flatfile";
import { SpaceType } from "../../../lib/space";

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
  const user = await prisma.user.findUnique({
    where: {
      id: token.sub,
    },
  });

  if (!user) {
    throw new Error("No user found");
  }

  const accessToken = await getAccessToken({
    clientId: process.env.ONBOARDING_CLIENT_ID as string,
    secret: process.env.ONBOARDING_CLIENT_SECRET as string,
  });

  const flatfileSpaceData = await createSpace({
    accessToken,
    spaceConfigId: process.env.ONBOARDING_SPACE_CONFIG_ID as string,
    environmentId: process.env.ONBOARDING_ENVIRONMENT_ID as string,
  });
  const spaceId = flatfileSpaceData.id;

  const addGuestToSpaceResponse = await addGuestToSpace(
    user,
    flatfileSpaceData,
    accessToken,
    process.env.ONBOARDING_ENVIRONMENT_ID as string
  );

  if (
    addGuestToSpaceResponse.errors &&
    addGuestToSpaceResponse.errors[0].message
  ) {
    res.redirect(
      "/project-onboarding?flash=error&message=Error setting up Flatfile"
    );
  }

  const flatfileSpaceDataRefetch = await getSpace(
    flatfileSpaceData.id,
    accessToken
  );

  // TODO: Don't need this, already sending an email on create?
  // const inviteGuestsToSpaceResponse = await inviteGuestToSpace(
  //   addGuestToSpaceResponse[0].id,
  //   spaceId,
  //   accessToken
  // );

  // console.log('inviteGuestsToSpaceResponse', inviteGuestsToSpaceResponse.success);

  const space: Space = await prisma.space.create({
    data: {
      userId: user.id,
      flatfileData:
        flatfileSpaceDataRefetch as unknown as Prisma.InputJsonValue,
      type: SpaceType.WorkbookUpload,
    },
  });

  // console.log("space", space);
  // console.log("space data", space.flatfileData);

  const basePathUrl = `${process.env.BASEPATH_URL}/project-onboarding`;
  const initialDocumentBody = `<div> 
  <h1 style="margin-bottom: 0px;">Welcome! Let's import your data.</h1>
  <p style="margin-top: 0px; margin-bottom: 12px;">Follow the steps below in order. Note: you can always return to this page by clicking "Welcome" in the left-hand sidebar.</p>
  <h2 style="margin-bottom: 0px;">1. Visit Files</h2>
  <p style="margin-top: 0px; margin-bottom: 8px;">Click "Files" in the left-hand sidebar. This is where you can upload files you want to import into Flatfile.</p>
  <h2 style="margin-bottom: 0px;">2. Upload the sample data</h2>
  <p style="margin-top: 0px; margin-bottom: 8px;">On the Files page, click "Add files" or drag-and-drop the sample data you downloaded previously onto the page.</p>
  <p style="margin-top: 0px; margin-bottom: 8px;">After the file uploads, click "Import" and follow the steps to completion to import the workbook.</p>
  <h2 style="margin-bottom: 0px;">3. Return to HCM.show</h2>
  <p style="margin-top: 0px; margin-bottom: 12px;">After uploading and importing the sample data, click the button below to return to HCM.show and click "Sync Records" to sync the data back into HCM.show.</p>
  <a 
    class="return-button"
    style="
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid #4c48ef;
      text-decoration: none;
      background-color: white;
      color: #4c48ef;
      display: inline-block;"
    href="${basePathUrl}">Return to HCM.show</a>
</div>`;

  const addDocumentToSpaceResponse = await addDocumentToSpace(
    "Welcome",
    initialDocumentBody,
    spaceId,
    accessToken
  );

  // console.log("addDocumentToSpaceResponse", addDocumentToSpaceResponse);

  res.redirect("/project-onboarding?flash=success&message=Setup Flatfile!");
}
