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

export const findSpaceForType = async ({
  userId,
  type,
}: {
  userId: string;
  type: SpaceType;
}) => {
  return await prismaClient.space.findUnique({
    where: {
      userId_type: {
        userId,
        type: SpaceType.Dynamic,
      },
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
