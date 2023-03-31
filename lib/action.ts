import { Action, PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";

export enum ActionType {
  SyncRecords = "sync-records",
  FileFeedEvent = "file-feed-event",
}

export enum ActionState {
  Initial = "initial",
  Complete = "complete",
  Error = "error",
}

export enum FileFeedEventType {
  RecordsCreated = "records:created",
  RecordsUpdated = "records:updated",
  RecordsDeleted = "records:deleted",
}

export type FileFeedEvent = {
  topic: FileFeedEventType;
  description: string;
  when: string;
};

export const getActions = async (organizationId: string) => {
  const prisma = new PrismaClient();
  return await prisma.action.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },
  });
};

export const createAction = async (
  data: Omit<Action, "id" | "createdAt" | "updatedAt">
) => {
  const prisma = new PrismaClient();
  return await prisma.action.create({
    data: {
      ...data,
      metadata: data.metadata || {},
    },
  });
};

export const fileFeedEventFromAction = (action: Action) => {
  const metadata = action.metadata as {
    topic: string;
  };

  return {
    topic: metadata.topic,
    description: descriptionForEventType(metadata.topic),
    when: DateTime.fromJSDate(action.createdAt).toFormat(
      "MM/dd/yyyy hh:mm:ssa"
    ),
  };
};

const descriptionForEventType = (eventType: string) => {
  switch (eventType) {
    case FileFeedEventType.RecordsCreated:
      return "New records were created in Flatfile.";
    case FileFeedEventType.RecordsUpdated:
      return "Records were updated in Flatfile.";
    case FileFeedEventType.RecordsDeleted:
      return "Records were deleted in Flatfile.";
    default:
      return "An unknown event occurred.";
  }
};
