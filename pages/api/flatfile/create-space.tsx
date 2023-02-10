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

  const flatfileSpaceData = await createSpace(accessToken);
  const spaceId = flatfileSpaceData.id;

  const addGuestToSpaceResponse = await addGuestToSpace(
    user,
    flatfileSpaceData,
    accessToken
  );

  if (
    addGuestToSpaceResponse.errors &&
    addGuestToSpaceResponse.errors[0].message
  ) {
    res.redirect(
      "/workbook-upload?flash=error&message=Error setting up Flatfile"
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
    },
  });

  // console.log("space", space);
  // console.log("space data", space.flatfileData);

  const basePathUrl = `${process.env.BASEPATH_URL}/workbook-upload`;
  const initialDocumentBody = `<div> 
                                <h1>Let's import your data.</h1> 
                                <ol style="padding-left: 16px;">
                                  <li style="margin-bottom: 8px;">First, start by clicking "Files" in the left-hand sidebar and uploading the sample data you downloaded previously.</li>
                                  <li style="margin-bottom: 8px;">After uploading the sample data, you can view the resulting records by clicking on the sheet name in the left-hand sidebar.</li>
                                  <li style="margin-bottom: 8px;">When you're ready, <a href="${basePathUrl}" style="text-decoration: underline;">click here to return to HCM.show</a> to sync these records back into HCM.show.</li>
                                </ol>
                              </div>`;

  const addDocumentToSpaceResponse = await addDocumentToSpace(
    "Welcome",
    initialDocumentBody,
    spaceId,
    accessToken
  );

  // console.log("addDocumentToSpaceResponse", addDocumentToSpaceResponse);

  res.redirect("/workbook-upload?message=Setup Flatfile!");
}
