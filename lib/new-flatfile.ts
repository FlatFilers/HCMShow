import { FlatfileClient } from "@flatfile/api";
import { ListWorkbooksRequest } from "@flatfile/api/api";

const flatfileClient = () => {
  const token = process.env.FLATFILE_API_KEY;

  if (!token) {
    throw new Error("No FLATFILE_API_KEY ENV");
  }

  return new FlatfileClient({
    token,
  });
};

export const createSpace = async ({
  userId,
  environmentId,
  spaceName,
}: {
  userId: string;
  environmentId: string;
  spaceName: string;
}) => {
  const flatfile = flatfileClient();

  try {
    const result = await flatfile.spaces.create({
      name: spaceName,
      environmentId,
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
  environmentId,
  email,
  name,
  spaceId,
}: {
  environmentId: string;
  email: string;
  name: string;
  spaceId: string;
}) => {
  try {
    const flatfile = flatfileClient();

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

export const listWorkbooks = async ({ spaceId }: { spaceId: string }) => {
  try {
    const flatfile = flatfileClient();

    const result = await flatfile.workbooks.list({ spaceId });

    return result;
  } catch (e) {
    console.log("error", JSON.stringify(e, null, 2));
    return null;
  }
};

export const getRecords = async ({ sheetId }: { sheetId: string }) => {
  try {
    const flatfile = flatfileClient();

    const response = await flatfile.records.get(sheetId);

    return response.data.records;
  } catch (e) {
    console.log("error", JSON.stringify(e, null, 2));
    return null;
  }
};