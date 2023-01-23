// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
  DefaultApi,
  Configuration,
  ConfigurationParameters,
  AddSpaceConfigRequest,
  AuthenticateRequest,
  GetAccessTokenOperationRequest,
  GetAccessTokenRequest,
  AccessTokenResponse,
  AddSpaceRequest,
  SpaceConfig,
} from "@flatfile/api";
import { PrismaClient, Space, User } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { userAgent } from "next/server";

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
  const configParams: ConfigurationParameters = {
    basePath,
  };
  const config: Configuration = new Configuration(configParams);
  const client = new DefaultApi(config);

  const getAccessTokenRequest: GetAccessTokenRequest = {
    clientId: process.env.FLATFILE_CLIENT_ID,
    secret: process.env.FLATFILE_CLIENT_SECRET,
  };

  const getAccessTokenOperationRequest: GetAccessTokenOperationRequest = {
    getAccessTokenRequest,
  };
  const accessTokenResponse: AccessTokenResponse = await client.getAccessToken(
    getAccessTokenOperationRequest
  );

  console.log("response", accessTokenResponse);

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
  const addGuestToSpaceResponse: Response = await fetch(`${basePath}/guests`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: headers,
  });

  console.log("addGuestToSpaceResponse", addGuestToSpaceResponse);
  // console.log(
  //   "addGuestToSpaceResponse body",
  //   await addGuestToSpaceResponse.json()
  // );

  if (!addGuestToSpaceResponse.ok) {
    res.status(500).json({ message: "Error adding guest to space" });
    return;
  }

  const addGuestResult = await addGuestToSpaceResponse.json();
  console.log("addGuestResult", addGuestResult, addGuestResult.data.spaces);

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