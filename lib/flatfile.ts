import {
  DefaultApi,
  Configuration,
  ConfigurationParameters,
  GetAccessTokenOperationRequest,
  GetAccessTokenRequest,
  AccessTokenResponse,
} from "@flatfile/api";

export default async function getAccessToken() {
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
    throw new Error("Error fetching access token");
  }

  return accessTokenResponse.data.accessToken;
}
