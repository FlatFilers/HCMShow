import { Space } from "@prisma/client";
import { prismaClient } from "../lib/prisma-client";

export enum SpaceType {
  ProjectOnboarding = "project-onboarding",
  FileFeed = "file-feed",
  Embed = "embed",
}

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
