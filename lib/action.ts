import { Action, Prisma, PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";

export enum ActionType {
  SyncRecords = "sync-records",
  FileFeedEvent = "file-feed-event",
  SyncOnboardingRecords = "sync-onboarding-records",
  SyncEmbedRecords = "sync-embed-records",
  SyncFilefeedRecords = "sync-filefeed-records",
  SyncDynamicRecords = "sync-dynamic-records",
}

export enum ActionState {
  Initial = "initial",
  Complete = "complete",
  Error = "error",
}

export type FileFeedEvent = {
  topic: string;
  when: string;
};

export type SerializeableAction = {
  id: string;
  createdAt: string;
  type: string;
  description: string;
  metadata: Prisma.JsonValue;
  user: {
    email: string;
  };
};

export const getActions = async (
  organizationId: string,
  types?: ActionType[]
) => {
  const prisma = new PrismaClient();

  const whereParams = {
    organizationId,
    ...(types && { type: { in: types } }),
  };

  return await prisma.action.findMany({
    where: whereParams,
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
  // console.log("createAction data", data);

  return await prisma.action.create({
    data: {
      ...data,
      metadata: data.metadata || {},
    },
  });
};

export const fileFeedEventFromAction = (
  action: SerializeableAction
): FileFeedEvent => {
  const metadata = action.metadata as {
    topic: string;
  };

  const date =
    typeof action.createdAt === "string"
      ? DateTime.fromISO(action.createdAt, {
          zone: "utc",
        })
      : DateTime.fromJSDate(action.createdAt, {
          zone: "utc",
        });

  return {
    topic: metadata.topic,
    when: date.toFormat("MM/dd/yyyy hh:mm:ssa"),
  };
};
