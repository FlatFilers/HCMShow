import { FlatfileClient } from "@flatfile/api";
import { ListWorkbooksRequest } from "@flatfile/api/api";
import { getSpaceConfig } from "./flatfile";

// TODO: Need to take in per-workflow API key here
const flatfileClient = (flowName: string) => {
  const onboarding = process.env.ONBOARDING_FLATFILE_API_KEY;
  const embedded = process.env.FILEFEED_FLATFILE_API_KEY;
  const filefeed = process.env.EMBEDDED_FLATFILE_API_KEY;
  const dynamic = process.env.DYNAMIC_FLATFILE_API_KEY;
  let token;

  switch (flowName) {
    case "onboarding":
      token = onboarding;
    case "embedded":
      token = embedded;
    case "filefeed":
      token = filefeed;
    case "dynamic":
      token = dynamic;
  }

  if (!token) {
    throw new Error("No FLATFILE_API_KEY ENV");
  }

  return new FlatfileClient({
    token,
  });
};

export const createSpace = async ({
  flowName,
  userId,
  environmentId,
  spaceName,
}: {
  flowName: string;
  userId: string;
  environmentId: string;
  spaceName: string;
}) => {
  const flatfile = flatfileClient(flowName);

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
    console.log("error", JSON.stringify(e, null, 2));
    return null;
  }
};

export const addGuestToSpace = async ({
  flowName,
  environmentId,
  email,
  name,
  spaceId,
}: {
  flowName: string;
  environmentId: string;
  email: string;
  name: string;
  spaceId: string;
}) => {
  try {
    const flatfile = flatfileClient(flowName);

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
    console.log("error", JSON.stringify(e, null, 2));
    return null;
  }
};

export const addDocumentToSpace = async ({
  flowName,
  title,
  body,
  spaceId,
}: {
  flowName: string;
  title: string;
  body: string;
  spaceId: string;
}) => {
  try {
    const flatfile = flatfileClient(flowName);

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
  flowName,
  spaceId,
}: {
  flowName: string;
  spaceId: string;
}) => {
  try {
    const flatfile = flatfileClient(flowName);

    const result = await flatfile.workbooks.list({ spaceId });

    return result;
  } catch (e) {
    console.log("error", JSON.stringify(e, null, 2));
    return null;
  }
};

export const listSpaces = async ({
  flowName,
  environmentId,
}: {
  flowName: string;
  environmentId: string;
}) => {
  try {
    const flatfile = flatfileClient(flowName);

    const result = await flatfile.spaces.list({ environmentId });

    return result;
  } catch (e) {
    console.log("error", JSON.stringify(e, null, 2));
    return null;
  }
};

export const getSpace = async (flowName: string, spaceId: string) => {
  try {
    const flatfile = flatfileClient(flowName);

    const result = await flatfile.spaces.get(spaceId);

    return result.data;
  } catch (e) {
    console.log("getSpace() error:", JSON.stringify(e, null, 2));
    return null;
  }
};

export const getWorkbook = async (flowName: string, workbookId: string) => {
  try {
    const flatfile = flatfileClient(flowName);

    const result = await flatfile.workbooks.get(workbookId);

    return result.data;
  } catch (e) {
    console.log("getWorkbook() error:", JSON.stringify(e, null, 2));
    return null;
  }
};

export const getRecords = async ({
  flowName,
  sheetId,
}: {
  flowName: string;
  sheetId: string;
}) => {
  try {
    const flatfile = flatfileClient(flowName);

    const response = await flatfile.records.get(sheetId);

    return response.data.records;
  } catch (e) {
    console.log("error", JSON.stringify(e, null, 2));
    return null;
  }
};

export const postFile = async ({
  flowName,
  spaceId,
  environmentId,
  file,
}: {
  flowName: string;
  spaceId: string;
  environmentId: string;
  file: string;
}) => {
  try {
    const flatfile = flatfileClient(flowName);
    const response = await flatfile.files.upload({
      spaceId,
      environmentId,
      file,
    });

    return response.data;
  } catch (e) {
    console.log("error", JSON.stringify(e, null, 2));
    return null;
  }
};
