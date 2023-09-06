import { Prisma, Space } from "@prisma/client";
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
  return await prismaClient.space.findUniqueOrThrow({
    where: {
      userId,
      flatfileSpaceId,
    },
  });
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
        type,
      },
    },
  });
};

export const getSpaceForFlatfileSpaceId = async (
  flatfileSpaceId: string
): Promise<Space> => {
  return await prismaClient.space.findUniqueOrThrow({
    where: {
      flatfileSpaceId,
    },
  });
};

export class SpaceRepo {
  static createSpace = async ({
    userId,
    flatfileData,
    type,
  }: {
    userId: string;
    flatfileData: any;
    type: SpaceType;
  }) => {
    return await prismaClient.space.create({
      data: {
        userId,
        flatfileSpaceId: flatfileData.id,
        flatfileData: flatfileData as unknown as Prisma.InputJsonValue,
        type,
      },
    });
  };
}
