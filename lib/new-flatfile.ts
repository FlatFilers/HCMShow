import { FlatfileClient } from "@flatfile/api";
import fs from "fs";

// TODO: Need to take in per-workflow API key here
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
//   environmentId,
//   email,
//   name,
//   spaceId,
// }: {
//   environmentId: string;
//   email: string;
//   name: string;
//   spaceId: string;
// }) => {
//   try {
//     const flatfile = flatfileClient();

//     const result = await flatfile.guests.create([
//       {
//         environmentId,
//         email,
//         name,
//         spaces: [
//           {
//             id: spaceId,
//           },
//         ],
//       },
//     ]);

//     return result.data;
//   } catch (e) {
//     console.log("error", JSON.stringify(e, null, 2));
//     return null;
//   }
// };

export const addDocumentToSpace = async ({
  title,
  body,
  spaceId,
}: {
  title: string;
  body: string;
  spaceId: string;
}) => {
  try {
    const flatfile = flatfileClient();

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

export const getSpace = async (spaceId: string) => {
  try {
    const flatfile = flatfileClient();

    const result = await flatfile.spaces.get(spaceId);

    return result.data;
  } catch (e) {
    console.log("getSpace() error:", JSON.stringify(e, null, 2));
    return null;
  }
};

export const getWorkbook = async (workbookId: string) => {
  try {
    const flatfile = flatfileClient();

    const result = await flatfile.workbooks.get(workbookId);

    return result.data;
  } catch (e) {
    console.log("getWorkbook() error:", JSON.stringify(e, null, 2));
    return null;
  }
};
