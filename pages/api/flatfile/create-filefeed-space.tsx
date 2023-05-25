// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Space } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import {
  FlatfileSpaceData,
  addDocumentToSpace,
  addGuestToSpace,
  createSpace,
  getAccessToken,
  getSpace,
  postFile,
} from "../../../lib/flatfile";
import { SpaceType } from "../../../lib/space";
import { fetchFileFromDrive } from "../../../lib/google-drive";

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
  const user = await prisma.user.findUnique({
    where: {
      id: token.sub,
    },
  });

  if (!user) {
    throw new Error("No user found");
  }

  const accessToken = await getAccessToken({
    clientId: process.env.CLIENT_ID as string,
    secret: process.env.CLIENT_SECRET as string,
  });

  const environmentId = process.env.FILEFEED_ENVIRONMENT_ID as string;

  const flatfileSpaceData = await createSpace({
    accessToken,
    spaceConfigId: process.env.FILEFEED_SPACE_CONFIG_ID as string,
    environmentId,
    userId: user.id,
    focusBgColor: "#616A7D",
    backgroundColor: "#090B2B",
  });

  const addGuestToSpaceResponse = await addGuestToSpace(
    user,
    flatfileSpaceData,
    accessToken,
    environmentId
  );

  console.log("addGuestToSpaceResponse", addGuestToSpaceResponse);

  if (
    addGuestToSpaceResponse.errors &&
    addGuestToSpaceResponse.errors[0].message
  ) {
    res.redirect("/file-feed?flash=error&message=Error setting up Flatfile");
  }

  const flatfileSpaceDataRefetch = await getSpace(
    flatfileSpaceData.id,
    accessToken
  );

  console.log("flatfileSpaceDataRefetch", flatfileSpaceDataRefetch);

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
      type: SpaceType.FileFeed,
      flatfileData:
        flatfileSpaceDataRefetch as unknown as Prisma.InputJsonValue,
    },
  });

  const initialDocumentBody = `<div> 
  <h1 style="margin-bottom: 36px;">Welcome! We're excited to help you import your data to HCM Show.</h1>
  <h2 style="margin-top: 0px; margin-bottom: 12px;">Follow the steps below to get started:</h2>
  <h2 style="margin-bottom: 0px;">1. Upload your file</h2>
  <p style="margin-top: 0px; margin-bottom: 8px;">Click "Files" in the left-hand sidebar, and upload the sample data you want to import into Flatfile. You can do this by clicking "Add files" or dragging and dropping the file onto the page.</p>
  <h2 style="margin-bottom: 0px;">2. Import the Benefit Elections Data</h2>
  <p style="margin-top: 0px; margin-bottom: 8px;">Click "Import" and select the benefit elections data. Follow the mapping instructions in Flatfile to complete the import. Once the data has been mapped, it will be loaded into Flatfile's table UI, where validations and transformations have been applied.</p>
  <h2 style="margin-bottom: 0px;">3. Validate and Transform Data</h2>
  <p style="margin-top: 0px; margin-bottom: 8px;">Make sure to verify that your data is correctly formatted and transformed by Flatfile. Flatfile will handle formatting dates, rounding amounts, and validating the existence of employees and benefit plans for you! If there are any issues or errors, you can easily address them within Flatfile's user interface.</p>
  <h2 style="margin-bottom: 0px;">4. Load Data into HCM.Show</h2>
  <p style="margin-top: 0px; margin-bottom: 12px;">Once the data has been validated and transformed, use the “Push records to HCM.show” button to load data into the HCM.Show application.</p>
  <h2 style="margin-bottom: 0px;">5. Return to HCM.Show</h2>
  <p style="margin-top: 0px; margin-bottom: 36px;">Once you have loaded the data from Flatfile to HCM Show, return to HCM.Show and navigate to the Data Templates section within the application to view the benefit elections data that you have just loaded.</p>
  <h3 style="margin-top: 0px; margin-bottom: 12px;">Remember, if you need any assistance, you can always refer back to this page by clicking "Welcome" in the left-hand sidebar!</h3>
</div>`;

  const addDocumentToSpaceResponse = await addDocumentToSpace(
    "Welcome",
    initialDocumentBody,
    flatfileSpaceData.id,
    accessToken
  );

  // console.log("addDocumentToSpaceResponse", addDocumentToSpaceResponse);

  const file = await fetchFileFromDrive();

  const spaceId = (space.flatfileData as unknown as FlatfileSpaceData).id;
  await postFile(accessToken, spaceId, file);

  res.redirect("/file-feed?flash=success&message=Setup Flatfile!");
}
