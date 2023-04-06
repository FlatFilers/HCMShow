import {
  DefaultApi,
  Configuration,
  ConfigurationParameters,
  GetAccessTokenOperationRequest,
  GetAccessTokenRequest,
  AccessTokenResponse,
  Blueprint,
} from "@flatfile/api";
import { PrismaClient, Space, User } from "@prisma/client";
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
      id: string;
      name: string;
      config: object[];
    }
  ];
};

const BASE_PATH = "https://api.x.flatfile.com/v1";

export async function getAccessToken(
  clientId: string = process.env.FLATFILE_CLIENT_ID as string,
  secret: string = process.env.FLATFILE_CLIENT_SECRET as string
): Promise<string> {
  const configParams: ConfigurationParameters = {
    basePath: BASE_PATH,
  };
  const config: Configuration = new Configuration(configParams);
  const client = new DefaultApi(config);

  const getAccessTokenRequest: GetAccessTokenRequest = {
    clientId,
    secret,
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

export const createSpace = async ({
  accessToken,
  spaceConfigId,
  environmentId,
}: {
  accessToken: string;
  spaceConfigId: string;
  environmentId?: string;
}) => {
  if (!spaceConfigId) {
    throw "No spaceConfigID found. Possible missing ENV var.";
  }

  const spacePayload = {
    spaceConfigId,
    environmentId,
    name: "HCM.show",
    metadata: {},
    actions: [],
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
    console.log("spaceResponse", await spaceResponse.json());
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
  accessToken: string,
  environmentId: string = process.env.FLATFILE_ENVIRONMENT_ID as string
) => {
  const payload = [
    {
      environmentId,
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

export interface BlueprintWithId extends Blueprint {
  id: string;
}
export interface SpaceConfigWithBlueprints {
  id: string;
  slug: string;
  name: string;
  blueprints: BlueprintWithId[];
}

export const getSpaceConfig = async (accessToken: string) => {
  const spaceConfigResponse: Response = await fetch(
    `${BASE_PATH}/spaces/configs`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!spaceConfigResponse.ok) {
    throw new Error("Error getting space config");
  }

  const spaceConfigResult = await spaceConfigResponse.json();

  // spaceConfigResult.data.map(())

  const config = spaceConfigResult.data.find(
    (config: SpaceConfigWithBlueprints) => {
      return config.id === process.env.ONBOARDING_SPACE_CONFIG_ID;
    }
  );

  // console.log("spaceConfigResult", spaceConfigResult.data);
  // console.log("config ID", process.env.ONBOARDING_SPACE_CONFIG_ID);

  // console.log("config", util.inspect(config, { depth: null }));

  return config;
};

const FormData = require("form-data");

export const postFile = async (
  accessToken: string,
  spaceId: string,
  file: any
) => {
  const formData = new FormData();
  formData.append("spaceId", spaceId);
  formData.append("environmentId", process.env.FILEFEED_ENVIRONMENT_ID);
  formData.append("file", Buffer.from(file), {
    filename: `HCM Example Employees.csv`,
  });

  console.log("formData", formData);

  const filesResponse: Response = await fetch(`${BASE_PATH}/files`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...formData.getHeaders(),
    },
  });

  if (!filesResponse.ok) {
    console.log("filesResponse body", await filesResponse.json());
    throw new Error("Error posting file");
  }
};
