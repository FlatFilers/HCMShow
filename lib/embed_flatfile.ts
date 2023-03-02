import { getAccessToken } from "./flatfile";

export const setupEmbedded = async () => {
  const accessToken = await getAccessToken();
  console.log("accessToken", accessToken);

  const environmentToken = await createEnvironment(accessToken);

  return {
    accessToken: accessToken,
    environmentToken: environmentToken,
  };
};

const BASE_PATH = "https://api.x.flatfile.com/v1";

export interface FlatfileEnvironmentData {
  accountId: string;
  id: string;
  name: string;
  idProd: boolean;
  newSpaceInherit: boolean;
  guestAuthentication: string[];
}

export const createEnvironment = async (accessToken: string) => {
  const environmentPayload = {
    name: "HCM Show",
    isProd: process.env.NODE_ENV_IS_PROD === "true",
    guestAuthentication: ["shared_link"],
  };

  const environmentResponse = await fetch(`${BASE_PATH}/environments`, {
    method: "POST",
    body: JSON.stringify(environmentPayload),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!environmentResponse.ok) {
    throw new Error("Error creating environmnent");
  }

  const environmentResult = await environmentResponse.json();

  console.log("environmentResult body", environmentResult);

  return environmentResult.data as FlatfileEnvironmentData;
};
