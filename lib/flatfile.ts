import {
  DefaultApi,
  Configuration,
  ConfigurationParameters,
  GetAccessTokenOperationRequest,
  GetAccessTokenRequest,
  AccessTokenResponse,
} from "@flatfile/api";
import { PrismaClient } from "@prisma/client";

export interface Field {
  value: string | null;
  valid: boolean;
  message: [];
}

export interface Record {
  id: string;
  values: {
    endEmployementDate: Field;
    employeeId: Field;
    managerId: Field;
    employeeType: Field;
    hireDate: Field;
  };
}

const BASE_PATH = "https://api.x.flatfile.com/v1";

export async function getAccessToken() {
  const configParams: ConfigurationParameters = {
    basePath: BASE_PATH,
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

  // console.log("response", accessTokenResponse);

  if (!accessTokenResponse.data?.accessToken) {
    throw new Error("Error fetching access token");
  }

  return accessTokenResponse.data.accessToken;
}

export const getRecords = async (
  userId: string,
  accessToken: string
): Promise<Record[]> => {
  const prisma = new PrismaClient();

  const space = await prisma.space.findFirst({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!space) {
    throw new Error(`No space for user ${userId}`);
  }

  console.log("space", space);

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  const { workbookId, sheetId } = await getWorkbookIdAndSheetId(
    space.flatfileSpaceId,
    headers
  );

  const recordsResponse = await fetch(
    `${BASE_PATH}/workbooks/${workbookId}/sheets/${sheetId}/records`,
    {
      method: "GET",
      headers: headers,
    }
  );

  // console.log("recordsResponse", recordsResponse);

  if (!recordsResponse.ok) {
    throw new Error(
      `Error getting records for spaceId: ${space.id}, flatfileSpaceId: ${space.flatfileSpaceId}, flatfile workbookId: ${workbookId}, flatfile sheetId: ${sheetId}`
    );
  }

  const recordsResult = await recordsResponse.json();

  // console.log("recordsResult", recordsResult);

  return recordsResult.data.records;
};

const getWorkbookIdAndSheetId = async (
  flatfileSpaceId: string,
  headers: any
): Promise<{ workbookId: string; sheetId: string }> => {
  const response = await fetch(
    `${BASE_PATH}/workbooks?spaceId=${flatfileSpaceId}`,
    {
      method: "GET",
      headers,
    }
  );

  // console.log("getWorkbooks response", response);

  const result = await response.json();

  // TODO: Assuming just 1 of each. Maybe ok for this demo case?
  // console.log("workbooks", result["data"].length);
  // console.log("sheet", result["data"][0]["sheets"].length);

  return {
    workbookId: result["data"][0]["id"],
    sheetId: result["data"][0]["sheets"][0]["id"],
  };
};

export const validRecords = (records: Record[]) => {
  return records.filter((r) => Object.values(r.values).every((f) => f.valid));
};
