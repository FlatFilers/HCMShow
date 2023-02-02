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

  const addGuestToSpaceResponse = await addGuestToSpace(user, flatfileSpaceData, accessToken);

  const flatfileSpaceDataRefetch = await getSpace(
    flatfileSpaceData.id,
    accessToken
  );

  const inviteGuestsToSpaceResponse = await inviteGuestToSpace(addGuestToSpaceResponse[0].id, spaceId, accessToken);

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
  
  const initialDocumentBody =
    '<div> \
      <h1>Welcome to your first Space!</h1> \
      <div class="mt-6"> \
        Now upload the sample dataset you downloaded from HCM.show by clicking "Files" in the left sidebar. \
      </div> \
      <div class="mt-4"> \
        After uploading you can view the records within Flatfile by clicking the workbook name in the sidebar.\
      </div> \
      <div class="mt-4"> \
          Once the records are imported into Flatfile, you can return to HCM.show by clicking \
        <a href="https://localhost:3000/onboarding" class="text-indigo-600"> \
          here \
        </a> \
          to sync them into the HCM show app.\
      </div> \
    </div>'

  const addDocumentToSpaceResponse = await addDocumentToSpace("Welcome", initialDocumentBody, spaceId, accessToken);

  // console.log("addDocumentToSpaceResponse", addDocumentToSpaceResponse);

  res.redirect("/onboarding?message=Created space");
}
