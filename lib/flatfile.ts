import { FlatfileClient } from "@flatfile/api";
import { ReadStream } from "fs";
import { prismaClient } from "./prisma-client";
import { SpaceType } from "./space";
import { Workbook } from "@flatfile/api/api";
import { DateTime } from "luxon";
import { SupportedLanguage } from "../components/language-context";

export enum WorkflowType {
  Onboarding = "onboarding",
  Embedded = "embedded",
  FileFeed = "filefeed",
  Dynamic = "dynamic",
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

const flatfileClient = (workflow: WorkflowType) => {
  let token;

  switch (workflow) {
    case WorkflowType.Onboarding:
      token = process.env.ONBOARDING_FLATFILE_API_KEY;
      break;
    case WorkflowType.FileFeed:
      token = process.env.FILEFEED_API_KEY;
      break;
    case WorkflowType.Embedded:
      token = process.env.EMBEDDED_FLATFILE_API_KEY;
      break;
    case WorkflowType.Dynamic:
      token = process.env.DYNAMIC_FLATFILE_API_KEY;
      break;
  }

  if (!token) {
    throw new Error(`No FLATFILE_API_KEY ENV for ${workflow}`);
  }

  return new FlatfileClient({
    token,
  });
};

export const createSpace = async ({
  workflow,
  userId,
  environmentId,
  spaceName,
  language,
}: {
  workflow: WorkflowType;
  userId: string;
  environmentId: string;
  spaceName: string;
  language: SupportedLanguage;
}) => {
  const flatfile = flatfileClient(workflow);

  try {
    const result = await flatfile.spaces.create({
      name: spaceName,
      environmentId,
      autoConfigure: true,
      metadata: {
        userId,
      },
      languageOverride: language,
    });

    // console.log("createSpace() result", result);

    return result.data;
  } catch (e) {
    console.log("createSpace() error", JSON.stringify(e, null, 2));
    return null;
  }
};

export const addGuestToSpace = async ({
  workflow,
  environmentId,
  email,
  name,
  spaceId,
}: {
  workflow: WorkflowType;
  environmentId: string;
  email: string;
  name: string;
  spaceId: string;
}) => {
  try {
    const flatfile = flatfileClient(workflow);

    // TODO: Temporary fix where a guest has auth errors if added to multiple spaces
    const timestamp = DateTime.now().toMillis();
    const newEmail = `${email.split("@")[0]}-${timestamp}@${
      email.split("@")[1]
    }`;

    const result = await flatfile.guests.create([
      {
        environmentId,
        email: newEmail,
        name,
        spaces: [
          {
            id: spaceId,
          },
        ],
      },
    ]);

    return result.data;
  } catch (e) {
    console.log("addGuestToSpace() error", JSON.stringify(e, null, 2));
    return null;
  }
};

export const addDocumentToSpace = async ({
  workflow,
  title,
  body,
  spaceId,
}: {
  workflow: WorkflowType;
  title: string;
  body: string;
  spaceId: string;
}) => {
  try {
    const flatfile = flatfileClient(workflow);

    const result = await flatfile.documents.create(spaceId, {
      title,
      body,
    });

    return result.data;
  } catch (e) {
    console.log("error", JSON.stringify(e, null, 2));
    return null;
  }
};

export const updateSpaceLanguage = async ({
  workflow,
  flatfileSpaceId,
  language,
}: {
  workflow: WorkflowType;
  flatfileSpaceId: string;
  language: SupportedLanguage;
}) => {
  const flatfile = flatfileClient(workflow);

  try {
    const result = await flatfile.spaces.update(flatfileSpaceId, {
      languageOverride: language,
    });

    return result.data;
  } catch (e) {
    console.log("updateSpaceLanguage() error", JSON.stringify(e, null, 2));
    return null;
  }
};

export const updateSpaceWorkbookId = async ({
  workflow,
  flatfileSpaceId,
  workbookId,
}: {
  workflow: WorkflowType;
  flatfileSpaceId: string;
  workbookId: string;
}) => {
  const flatfile = flatfileClient(workflow);

  try {
    const result = await flatfile.spaces.update(flatfileSpaceId, {
      primaryWorkbookId: workbookId,
    });

    return result.data;
  } catch (e) {
    console.log("updateSpaceWorkbookId() error", JSON.stringify(e, null, 2));
    return null;
  }
};

export const listWorkbooks = async ({
  workflow,
  spaceId,
}: {
  workflow: WorkflowType;
  spaceId: string;
}) => {
  try {
    const flatfile = flatfileClient(workflow);

    const result = await flatfile.workbooks.list({ spaceId });

    return result;
  } catch (e) {
    console.log("listWorkbooks() error", JSON.stringify(e, null, 2));
    return null;
  }
};

export const listSpaces = async ({
  workflow,
  environmentId,
}: {
  workflow: WorkflowType;
  environmentId: string;
}) => {
  try {
    const flatfile = flatfileClient(workflow);

    const result = await flatfile.spaces.list({ environmentId });

    return result;
  } catch (e) {
    console.log("error", JSON.stringify(e, null, 2));
    return null;
  }
};

export const getSpace = async ({
  workflow,
  spaceId,
}: {
  workflow: WorkflowType;
  spaceId: string;
}) => {
  try {
    const flatfile = flatfileClient(workflow);

    const result = await flatfile.spaces.get(spaceId);

    return result.data;
  } catch (e) {
    console.log("getSpace() error:", JSON.stringify(e, null, 2));
    return null;
  }
};

export const getWorkbook = async ({
  workflow,
  workbookId,
}: {
  workflow: WorkflowType;
  workbookId: string;
}) => {
  try {
    const flatfile = flatfileClient(workflow);

    const result = await flatfile.workbooks.get(workbookId);

    return result.data;
  } catch (e) {
    console.log("getWorkbook() error:", JSON.stringify(e, null, 2));
    return null;
  }
};

export const getRecords = async ({
  workflow,
  sheetId,
}: {
  workflow: WorkflowType;
  sheetId: string;
}) => {
  try {
    const flatfile = flatfileClient(workflow);

    // TODO: The Flatfile SDK is throwing validation errors on valid records for Jobs?
    const response = await flatfile.records.get(sheetId, { filter: "valid" });

    return response.data.records;
  } catch (e) {
    console.log("getRecords() error", JSON.stringify(e, null, 2));
    return null;
  }
};

export const postFile = async ({
  workflow,
  spaceId,
  environmentId,
  file,
}: {
  workflow: WorkflowType;
  spaceId: string;
  environmentId: string;
  file: ReadStream;
}) => {
  try {
    const flatfile = flatfileClient(workflow);
    const response = await flatfile.files.upload(file, {
      spaceId,
      environmentId,
    });

    return response.data;
  } catch (e) {
    console.log("postFile() error", JSON.stringify(e, null, 2));
    return null;
  }
};

export const getRecordsByName = async ({
  workflow,
  userId,
  workbookName,
  sheetName,
  spaceType,
  spaceId,
}: {
  workflow: WorkflowType;
  userId: string;
  workbookName: string;
  sheetName: string;
  spaceType: SpaceType;
  spaceId?: string;
}) => {
  const prisma = prismaClient;

  let flatfileSpaceId = (spaceId ||= "");

  if (!spaceId) {
    const space = await prisma.space.findUnique({
      where: {
        userId_type: {
          userId,
          type: spaceType,
        },
      },
    });

    if (!space) {
      throw new Error(`No space for user ${userId} and type ${spaceType}`);
    }

    flatfileSpaceId = space.flatfileSpaceId;
  }

  if (!flatfileSpaceId) {
    throw new Error(`No space for user ${userId}`);
  }

  const workbookIdAndSheetIds = await getWorkbookIdAndSheetIds({
    workflow,
    flatfileSpaceId: flatfileSpaceId,
    workbookName,
    sheetName,
  });

  const sheetId = workbookIdAndSheetIds?.sheetId;

  if (!sheetId) {
    console.log("no sheetId found. Unable to getRecords");
    return null;
  }

  // console.log("w, s", workbookId, sheetIds);
  const records = await getRecords({ workflow, sheetId });

  return records;
};

export const getSpaceAccessToken = async ({
  workflow,
  flatfileSpaceId,
}: {
  workflow: WorkflowType;
  flatfileSpaceId: string;
}) => {
  try {
    const flatfile = flatfileClient(workflow);

    const response = await flatfile.spaces.get(flatfileSpaceId);

    if (response.data.accessToken) {
      return response.data.accessToken;
    }

    throw new Error("No access token for space");
  } catch (e) {
    console.log("getSpaceAccessToken() error", JSON.stringify(e, null, 2));
    return null;
  }
};

export const createWorkbookForSpace = async ({
  workflow,
  flatfileSpaceId,
  workbookConfig,
}: {
  workflow: WorkflowType;
  flatfileSpaceId: string;
  workbookConfig: any;
}) => {
  try {
    const flatfile = flatfileClient(workflow);

    const response = await flatfile.workbooks.create({
      spaceId: flatfileSpaceId,
      ...workbookConfig,
    });

    console.log("response", response);

    return response.data;
  } catch (e) {
    console.log("createWorkbookForSpace() error", JSON.stringify(e, null, 2));
    return null;
  }
};
const getWorkbookIdAndSheetIds = async ({
  workflow,
  flatfileSpaceId,
  workbookName,
  sheetName,
}: {
  workflow: WorkflowType;
  flatfileSpaceId: string;
  workbookName: string;
  sheetName: string;
}) => {
  try {
    const response = await listWorkbooks({
      workflow,
      spaceId: flatfileSpaceId,
    });

    const workbookObj = response?.data.find((workbookObj: Workbook) => {
      return workbookObj.name === workbookName;
    });

    const sheets = workbookObj?.sheets?.find((s) => s.name === sheetName);

    return {
      workbookId: workbookObj?.id,
      sheetId: sheets?.id,
    };
  } catch (error) {
    console.error(
      `Error: getting workbookId and sheetIds for workbook ${workbookName} and sheet ${sheetName}`,
      error
    );
  }
};
