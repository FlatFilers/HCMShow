import { Action, Prisma, PrismaClient } from "@prisma/client";

export enum ActionType {
  SyncRecords = "sync-records",
  FileFeedEvent = "file-feed-event",
}

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
