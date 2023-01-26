import { Action, PrismaClient } from "@prisma/client";

export enum ActionType {
  SyncRecords = "sync-records",
}

export const getActions = async (organizationId: string) => {
  const prisma = new PrismaClient();
  return await prisma.action.findMany({
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
  return await prisma.action.create({ data });
};
