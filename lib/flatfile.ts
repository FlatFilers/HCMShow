import { FlatfileClient } from "@flatfile/api";
import { ReadStream } from "fs";
// import { ListWorkbooksRequest } from "@flatfile/api/api";
// import { getSpaceConfig } from "./flatfile";

export enum WorkflowType {
  Onboarding = "onboarding",
  Embedded = "embedded",
  FileFeed = "filefeed",
  Dynamic = "dynamic",
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
}: {
  workflow: WorkflowType;
  userId: string;
  environmentId: string;
  spaceName: string;
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
    });

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

    const result = await flatfile.guests.create([
      {
        environmentId,
        email,
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

    const response = await flatfile.records.get(sheetId);

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
