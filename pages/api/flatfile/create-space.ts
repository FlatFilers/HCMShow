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
import { env } from "process";

type Data = {
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const configParams: ConfigurationParameters = {
    basePath: "https://api.x.flatfile.com/v1",
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

  // Pre-setup space config ID = us_sc_66CPdlvn
  const spaceConfig: SpaceConfig = {
    spaceConfigId: "us_sc_66CPdlvn",
    environmentId: process.env.FLATFILE_ENVIRONMENT_ID as string,
    name: "Onboarding",
  };

  const spaceRequestParameters: AddSpaceRequest = {
    spaceConfig,
  };
  const options: RequestInit = {
    headers: [
      ["Authorization", `Bearer ${accessToken}`],
      ["Content-Type", "application/json"],
    ],
  };
  const spaceResponse = await client.addSpace(spaceRequestParameters, options);

  console.log("spaceResponse", spaceResponse);

  console.log("HERE");
  res.status(200).json({ message: "John Doe" });
}
