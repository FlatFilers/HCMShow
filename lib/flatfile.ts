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
import { PrismaClient, Space, User } from "@prisma/client";
import { Flatfile, FlatfileClient } from "@flatfile/api-beta";
import { Space as FlatfileSpace } from "@flatfile/api-beta/api/resources/spaces/types/Space";
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
      id: string;
      name: string;
      config: object[];
    }
  ];
};

const BASE_PATH = "https://api.x.flatfile.com/v1";

const flatfile = new FlatfileClient({
  clientId: process.env.FLATFILE_CLIENT_ID as string,
  clientSecret: process.env.FLATFILE_CLIENT_SECRET as string,
});

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
) => {
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

  try {
    const recordsResponse = await flatfile.sheets.getRecords(
      workbookId,
      sheetId,
      {}
    );

    return recordsResponse.data.records;
  } catch (err) {
    const message = `Error getting records for spaceId: ${
      space.id
    }, flatfileSpaceId: ${
      (space.flatfileData as unknown as FlatfileSpaceData).id
    }, flatfile workbookId: ${workbookId}, flatfile sheetId: ${sheetId}`;
    console.log(message, err);
    throw new Error(message);
  }

  // console.log("w, s", workbookId, sheetId);

  // const recordsResponse = await fetch(
  //   // TODO: eventually use valid filter here
  //   // `${BASE_PATH}/workbooks/${workbookId}/sheets/${sheetId}/records?filter=valid`,
  //   `${BASE_PATH}/workbooks/${workbookId}/sheets/${sheetId}/records`,
  //   {
  //     method: "GET",
  //     headers: headers,
  //   }
  // );

  // // console.log("recordsResponse", recordsResponse);

  // if (!recordsResponse.ok) {
  //   throw new Error(
  //     `Error getting records for spaceId: ${space.id}, flatfileSpaceId: ${
  //       (space.flatfileData as unknown as FlatfileSpaceData).id
  //     }, flatfile workbookId: ${workbookId}, flatfile sheetId: ${sheetId}`
  //   );
  // }

  // const recordsResult = await recordsResponse.json();

  // // console.log("recordsResult", recordsResult);

  // return recordsResult.data.records;
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

export const createSpace = async (spaceName: string) => {
  try {
    const spaceResponse = await flatfile.spaces.create({
      spaceConfigId: process.env.ONBOARDING_SPACE_CONFIG_ID as string,
      environmentId: process.env.FLATFILE_ENVIRONMENT_ID as string,
      name: spaceName,
    });

    return spaceResponse.data;
  } catch (err) {
    console.log("Error creating space", err);
    throw new Error("Error setting up space");
  }
};

export const getSpace = async (flatfileSpaceId: string) => {
  try {
    const res = await flatfile.spaces.get(flatfileSpaceId);
    return res.data;
  } catch (e) {
    console.log("Error getting space", e);
    throw new Error("Error retrieving space");
  }
};

export const addGuestToSpace = async (
  user: User,
  flatfileSpace: FlatfileSpace
) => {
  try {
    await flatfile.guests.create([
      {
        environmentId: process.env.FLATFILE_ENVIRONMENT_ID as string,
        email: user.email,
        name: "Guest",
        spaces: [
          {
            id: flatfileSpace.id,
          },
        ],
      },
    ]);
  } catch (e) {
    console.log("Error adding guest to space", e);
    throw new Error("Error adding you to the Flatfile workspace.");
  }
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
  spaceId: string
) => {
  try {
    await flatfile.documents.create(spaceId, {
      title,
      body,
    });
  } catch (e) {
    console.log("Error adding document to space", e);
    throw new Error("Error setting up space.");
  }
};
