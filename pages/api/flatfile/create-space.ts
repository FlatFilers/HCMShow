// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
  AddSpaceConfigRequest,
  AuthenticateRequest,
  AddSpaceRequest,
  SpaceConfig,
} from "@flatfile/api";
import { PrismaClient, Space, User } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { userAgent } from "next/server";
import getAccessToken from "../../../lib/flatfile";

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

  if (!token) {
    console.log("No session");
    return {
      notFound: true,
    };
  }

  const basePath: string = "https://api.x.flatfile.com/v1";

  const accessTokenResponse = await getAccessToken();

  if (!accessTokenResponse.data?.accessToken) {
    res.status(500).json({ message: "Error fetching access token" });
    return;
  }

  const accessToken: string = accessTokenResponse.data.accessToken;

  // Pre-setup space config ID
  const spaceConfigId = process.env.ONBOARDING_SPACE_CONFIG_ID;

  if (!spaceConfigId) {
    throw "Missing ENV var: ONBOARDING_SPACE_CONFIG_ID";
  }

  const spaceConfig: SpaceConfig = {
    spaceConfigId: spaceConfigId,
    environmentId: process.env.FLATFILE_ENVIRONMENT_ID as string,
    name: "Onboarding",
  };

  const spaceRequestParameters: AddSpaceRequest = {
    spaceConfig,
  };
  // TODO: Is there a way to use the SDK / OpenAPI wrapper to set these headers more elegantly?
  // client.setHeaders/setToken() etc that will remember it moving forward
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  const spacePayload = {
    spaceConfigId: spaceConfigId,
    environmentId: process.env.FLATFILE_ENVIRONMENT_ID,
  };

  const spaceResponse = await fetch(`${basePath}/spaces`, {
    method: "POST",
    body: JSON.stringify(spacePayload),
    headers: headers,
  });
  // const spaceResponse = await client.addSpace(spaceRequestParameters, options);

  console.log("spaceResponse", spaceResponse);

  if (!spaceResponse.ok) {
    res.status(500).json({ message: "Error creating space" });
    return;
  }

  const spaceResult = await spaceResponse.json();

  console.log("spaceResponse body", spaceResult);

  const spaceId: string = spaceResult.data.id;

  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({
    where: {
      id: token.sub,
    },
  });

  if (!user) {
    console.error("No user found");
    throw "No user found";
  }

  const payload = [
    {
      environmentId: process.env.FLATFILE_ENVIRONMENT_ID,
      email: user.email,
      name: "Mr. Guest",
      spaces: [
        {
          id: spaceId,
        },
      ],
    },
  ];

  // TODO: Need guest methods on API wrapper to call
  try {
    const addGuestToSpaceResponse: Response = await fetch(`${basePath}/guests`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: headers,
    });
    
    // TODO: Add guest API is breaking on email unique constraint
    // console.log("addGuestToSpaceResponse", addGuestToSpaceResponse);
    
    // if (!addGuestToSpaceResponse.ok) {
    //   res.status(500).json({ message: "Error adding guest to space" });
    //   return;
    // }

    // const addGuestResult = await addGuestToSpaceResponse.json();
    // console.log("addGuestResult", addGuestResult, addGuestResult.data.spaces);

    // console.log(
    //   "addGuestToSpaceResponse body",
    //   await addGuestToSpaceResponse.json()
    // );

  } catch (error) {

    console.log('catch error')
  }

  // Query the space to get the guest URL
  const getSpaceResponse: Response = await fetch(
    `${basePath}/spaces/${spaceId}`,
    {
      method: "GET",
      headers: headers,
    }
  );

  console.log("getSpaceResponse", getSpaceResponse);

  if (!getSpaceResponse.ok) {
    res.status(500).json({ message: "Error retrieving space" });
    return;
  }

  const getSpaceResult = await getSpaceResponse.json();
  console.log("getSpaceResult", getSpaceResult);

  const space: Space = await prisma.space.create({
    data: {
      userId: user.id,
      flatfileSpaceId: spaceId,
    },
  });

  const guestLink: string = getSpaceResult.data.guestLink;

  res.redirect(guestLink);
}
