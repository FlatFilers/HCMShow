import {
  DefaultApi,
  Configuration,
  ConfigurationParameters,
  GetAccessTokenOperationRequest,
  GetAccessTokenRequest,
  AccessTokenResponse,
  SpaceConfig,
  AddSpaceRequest,
} from "@flatfile/api";
import { PrismaClient, Space, User, prisma } from "@prisma/client";
import { DateTime } from "luxon";
import { inspect } from "util";
import { SpaceType } from "./space";

export interface Field {
  value: string | number | null;
  valid: boolean;
  message: [];
}

export interface Record {
  id: string;
  values: {
    [key: string]: Field;
    // endEmployementDate: Field;
    // employeeId: Field;
    // managerId: Field;
    // employeeType: Field;
    // hireDate: Field;
  };
}

export interface FlatfileSpaceData {
  id: string;
  workbooksCount: number;
  filesCount: number;
  createdByUserId: string;
  createdByUserName: string;
  guestLink: string;
  spaceConfigId: string;
  environmentId: string;
  primaryWorkbookId: string;
  name: string;
  displayOrder: number;
  sidebarConfigs: [
    {
      type: string;
      workbookId: string;
    }
  ];
}

type WorkbookObject = {
  id: string;
  name: string;
  labels: string[];
  spaceId: string;
  environmentId: string;
  blueprint: object | null;
  sheets: [
    {
      id: "us_sh_yyhOp0e0";
      name: "Employees";
      config: object[];
    }
  ];
};

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

export const getRecordsByName = async (
  userId: string,
  accessToken: string,
  sheetName: string,
  spaceType: SpaceType
): Promise<Record[]> => {
  const prisma = new PrismaClient();

  const space = await prisma.space.findUnique({
    where: {
      userId_type: {
        userId,
        type: spaceType,
      },
    },
  });

  if (!space) {
    throw new Error(`No space for user ${userId}`);
  }

  // console.log("space", space);

  const { workbookId, sheetId } = await getWorkbookIdAndSheetIds(
    (space.flatfileData as unknown as FlatfileSpaceData).id,
    accessToken,
    sheetName
  );

  // console.log("w, s", workbookId, sheetIds);

  const records = await fetchRecords(space, workbookId, sheetId, accessToken);

  return records;
};

const getWorkbookIdAndSheetIds = async (
  flatfileSpaceId: string,
  accessToken: string,
  sheetName: string
): Promise<{ workbookId: string; sheetId: string }> => {
  const response = await fetch(
    `${BASE_PATH}/workbooks?spaceId=${flatfileSpaceId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  // console.log("getWorkbooks response", response);

  const result = await response.json();

  // TODO: Assuming just 1 workbook for this demo (but multiple sheets).
  // console.log("sheets", result["data"][0]["sheets"]);

  const workbookObj = result.data.find((workbookObj: WorkbookObject) => {
    return workbookObj.name === process.env.WORKBOOK_UPLOAD_WORKBOOK_NAME;
  });
  const sheetId = workbookObj.sheets.find(
    (s: { id: string; name: string; config: any }) => s.name === sheetName
  )!.id;

  return {
    workbookId: workbookObj.id,
    sheetId: sheetId,
  };
};

const fetchRecords = async (
  space: Space,
  workbookId: string,
  sheetId: string,
  accessToken: string
): Promise<Record[]> => {
  const response = await fetch(
    `${BASE_PATH}/workbooks/${workbookId}/sheets/${sheetId}/records`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Error getting records for spaceId: ${space.id}, flatfileSpaceId: ${
        (space.flatfileData as unknown as FlatfileSpaceData).id
      }, flatfile workbookId: ${workbookId}`
    );
  }

  const recordsResult = await response.json();
  // console.log("rr", recordsResult.data.records);

  return await recordsResult.data.records;
};

export const createSpace = async (accessToken: string) => {
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
  const spacePayload = {
    spaceConfigId: spaceConfigId,
    environmentId: process.env.FLATFILE_ENVIRONMENT_ID,
  };

  const spaceResponse = await fetch(`${BASE_PATH}/spaces`, {
    method: "POST",
    body: JSON.stringify(spacePayload),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  // const spaceResponse = await client.addSpace(spaceRequestParameters, options);

  // console.log("spaceResponse", spaceResponse);

  if (!spaceResponse.ok) {
    throw new Error("Error creating space");
  }

  const spaceResult = await spaceResponse.json();

  // console.log("spaceResult body", spaceResult);

  // const spaceId: string = spaceResult.data.id;

  return spaceResult.data as FlatfileSpaceData;
};

export const getSpace = async (
  flatfileSpaceId: string,
  accessToken: string
) => {
  // Query the space to get the guest URL
  const getSpaceResponse: Response = await fetch(
    `${BASE_PATH}/spaces/${flatfileSpaceId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  // console.log("getSpaceResponse", getSpaceResponse);

  if (!getSpaceResponse.ok) {
    throw new Error("Error retrieving space");
  }

  const getSpaceResult = await getSpaceResponse.json();
  // console.log("getSpaceResult", getSpaceResult);

  return getSpaceResult.data as FlatfileSpaceData;
};

export const addGuestToSpace = async (
  user: User,
  flatfileSpaceData: FlatfileSpaceData,
  accessToken: string
) => {
  const payload = [
    {
      environmentId: process.env.FLATFILE_ENVIRONMENT_ID,
      email: user.email,
      name: "Guest",
      spaces: [
        {
          id: flatfileSpaceData.id,
        },
      ],
    },
  ];

  // TODO: Need guest methods on API wrapper to call
  const addGuestToSpaceResponse: Response = await fetch(`${BASE_PATH}/guests`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  // console.log("addGuestToSpaceResponse", addGuestToSpaceResponse);
  // console.log(
  //   "addGuestToSpaceResponse body",
  //   await addGuestToSpaceResponse.json()
  // );

  if (!addGuestToSpaceResponse.ok) {
    return await addGuestToSpaceResponse.json();
  }

  const addGuestResult = await addGuestToSpaceResponse.json();
  // console.log("addGuestResult", addGuestResult, addGuestResult.data.spaces);

  return addGuestResult.data;
};

export const inviteGuestToSpace = async (
  userId: string,
  spaceId: string,
  accessToken: string
) => {
  const payload = [
    {
      guestId: userId,
      spaceId: spaceId,
      message:
        "Accept the invite below to enter the space. From there, you will be able to upload your files.",
    },
  ];

  const inviteGuestToSpaceResponse: Response = await fetch(
    `${BASE_PATH}/invitations`,
    {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!inviteGuestToSpaceResponse.ok) {
    throw new Error("Error sending invite to guest");
  }

  const inviteGuestResult = await inviteGuestToSpaceResponse.json();

  return inviteGuestResult.data;
};

export const addDocumentToSpace = async (
  title: string,
  body: string,
  spaceId: string,
  accessToken: string
) => {
  const payload = {
    title: title,
    body: body,
  };

  const addDocumentToSpaceResponse: Response = await fetch(
    `${BASE_PATH}/spaces/${spaceId}/documents`,
    {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  // console.log("addDocumentToSpaceResponse", addDocumentToSpaceResponse);
  // console.log(
  //   "addDocumentToSpaceResponse body",
  //   await addDocumentToSpaceResponse.json()
  // );

  if (!addDocumentToSpaceResponse.ok) {
    throw new Error("Error adding document to space");
  }

  const addDocumentResult = await addDocumentToSpaceResponse.json();

  return addDocumentResult.data;
};
