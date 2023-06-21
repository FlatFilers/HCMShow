import { Space } from "@prisma/client";
import { prismaClient } from "../lib/prisma-client";

export enum SpaceType {
  WorkbookUpload = "workbook-upload",
  FileFeed = "file-feed",
  Embed = "embed",
  Dynamic = "dynamic",
}

export const findSpace = async ({
  userId,
  flatfileSpaceId,
}: {
  userId: string;
  flatfileSpaceId: string;
}) => {
  const spaces = await prismaClient.space.findMany({
    where: {
      userId,
      flatfileData: {
        path: ["id"],
        equals: flatfileSpaceId,
      },
    },
  });

  if (spaces.length > 1) {
    throw new Error(
      `More than one space found for flatfileSpaceId ${flatfileSpaceId}}`
    );
  } else if (spaces.length === 0) {
    throw new Error(`No space found for flatfileSpaceId ${flatfileSpaceId}`);
  }

  return spaces[0];
};

// TODO: This is a hack for /api/v1/sync-space
export const findSpaceForEmbed = async ({ userId }: { userId: string }) => {
  return await prismaClient.space.findFirst({
    where: {
      userId,
      type: SpaceType.Embed,
    },
  });
};

export const getSpaceForFlatfileSpaceId = async (
  flatfileSpaceId: string
): Promise<Space> => {
  const spaces = await prismaClient.space.findMany({
    where: {
      flatfileData: {
        path: ["id"],
        equals: flatfileSpaceId,
      },
    },
  });

  if (spaces.length > 1) {
    throw new Error(
      `More than one space found for flatfileSpaceId ${flatfileSpaceId}}`
    );
  } else if (spaces.length === 0) {
    throw new Error(`No space found for flatfileSpaceId ${flatfileSpaceId}`);
  }

  return spaces[0];
};
