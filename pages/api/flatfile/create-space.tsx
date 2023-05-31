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

  const accessToken = await getAccessToken();

  const flatfileSpaceData = await createSpace({
    accessToken,
    spaceConfigId: process.env.ONBOARDING_SPACE_CONFIG_ID as string,
    environmentId: process.env.ONBOARDING_ENVIRONMENT_ID as string,
    userId: user.id,
    focusBgColor: "#6673FF",
    backgroundColor: "#3B2FC9",
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

  const initialDocumentBody = `<div> 
  <h1 style="margin-bottom: 36px;">Welcome! We're excited to help you import your data to HCM Show.</h1>
  <h2 style="margin-top: 0px; margin-bottom: 12px;">Follow the steps below to get started:</h2>
  <h2 style="margin-bottom: 0px;">1. Upload your file</h2>
  <p style="margin-top: 0px; margin-bottom: 8px;">Click "Files" in the left-hand sidebar, and upload the sample data you want to import into Flatfile. You can do this by clicking "Add files" or dragging and dropping the file onto the page.</p>
  <h2 style="margin-bottom: 0px;">2. Import your Jobs Data</h2>
  <p style="margin-top: 0px; margin-bottom: 8px;">Click "Import" and select the Jobs data. Follow the mapping instructions in Flatfile to complete the import. Once the data has been mapped, it will be loaded into Flatfile's table UI, where validations and transformations have been applied.</p>
  <h2 style="margin-bottom: 0px;">3. Import your Employee Data</h2>
  <p style="margin-top: 0px; margin-bottom: 8px;">Click "Import" and select the Employee data. Follow the mapping instructions in Flatfile to complete the import. Once the data has been mapped, it will be loaded into Flatfile's table UI, where validations and transformations have been applied.</p>
  <h2 style="margin-bottom: 0px;">4. Validate and Transform Data</h2>
  <p style="margin-top: 0px; margin-bottom: 8px;">Ensure that the data is correctly formatted and transformed By Flatfile. You can easily address any issues and errors within Flatfile's user interface.</p>
  <h2 style="margin-bottom: 0px;">5. Load Data into HCM.Show</h2>
  <p style="margin-top: 0px; margin-bottom: 12px;">Once the data has been validated and transformed, use the custom action on each sheet to load the data into HCM.Show application.</p>
  <h2 style="margin-bottom: 0px;">6. Return to HCM.Show</h2>
  <p style="margin-top: 0px; margin-bottom: 36px;">Once you have loaded the data from Flatfile to HCM Show, return to HCM.Show and navigate to the Data Templates section within the application to view the Jobs and Employees data that you have just loaded.</p>
  <h3 style="margin-top: 0px; margin-bottom: 12px;">Remember, if you need any assistance, you can always refer back to this page by clicking "Welcome" in the left-hand sidebar!</h3>
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
