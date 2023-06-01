import { Action, Prisma, PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";

export enum ActionType {
  SyncRecords = "sync-records",
  FileFeedEvent = "file-feed-event",
  SyncEmbedRecords = "sync-embed-records",
}

export enum ActionState {
  Initial = "initial",
  Complete = "complete",
  Error = "error",
}

export enum FileFeedEventType {
  WorkbookAdded = "workbook:added",
  WorkbookCreated = "workbook:created",
  WorkbookUpdated = "workbook:updated",
  WorkbookDeleted = "workbook:deleted",
  SheetCreated = "sheet:created",
  SheetUpdated = "sheet:updated",
  SheetDeleted = "sheet:deleted",
  RecordsCreated = "records:created",
  RecordsUpdated = "records:updated",
  RecordsDeleted = "records:deleted",
  CommitCreated = "commit:created",
  CommitUpdated = "commit:updated",
  CommitDeleted = "commit:deleted",
  LayerCreated = "layer:created",
  UploadCompleted = "upload:completed",
  UploadUpdated = "upload:updated",
  UploadDeleted = "upload:deleted",
  FileCreated = "upload:created",
  FileUpdated = "upload:updated",
  FileDeleted = "upload:deleted",
  JobCreated = "job:created",
  JobReady = "job:ready",
  JobUpdated = "job:updated",
  JobCompleted = "job:completed",
  JobOutcomeAcknowledged = "job:outcome-acknowledged",
  JobFailed = "job:failed",
  JobScheduled = "job:scheduled",
  JobDeleted = "job:deleted",
  AgentCreated = "agent:created",
  AgentUpdated = "agent:updated",
  AgentDeleted = "agent:deleted",
  SpaceCreated = "space:created",
  SpaceDeleted = "space:deleted",
}

export type FileFeedEvent = {
  topic: FileFeedEventType;
  description: string;
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

export const getActions = async (organizationId: string, type?: ActionType) => {
  const prisma = new PrismaClient();

  let whereParams: { organizationId: string; type?: ActionType } = {
    organizationId,
  };

  if (type) {
    whereParams = {
      ...whereParams,
      type,
    };
  }

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
      ? DateTime.fromISO(action.createdAt)
      : DateTime.fromJSDate(action.createdAt);

  return {
    topic: metadata.topic as FileFeedEventType,
    description: descriptionForEventType(metadata.topic),
    when: date.toFormat("MM/dd/yyyy hh:mm:ssa"),
  };
};

const descriptionForEventType = (eventType: string) => {
  eventType = eventType.replace("upload:completed", "file:created");
  let event = eventType.split(":")[0];
  let action = eventType.split(":")[1];
  event = event.replace("records", "commit");
  event = event.replace("upload", "file");

  return `A ${event} was ${action} in Flatfile.`;

  // switch (eventType) {
  //   case FileFeedEventType.WorkbookAdded:
  //     return "A workbook was created in Flatfile.";
  //   case FileFeedEventType.WorkbookCreated:
  //     return "A workbook was created in Flatfile.";
  //   case FileFeedEventType.WorkbookUpdated:
  //     return "A workbook was updated in Flatfile.";
  //   case FileFeedEventType.WorkbookDeleted:
  //     return "A workbook was deleted in Flatfile.";
  //   case FileFeedEventType.SheetCreated:
  //     return "A sheet was created in Flatfile.";
  //   case FileFeedEventType.SheetUpdated:
  //     return "A sheet was updated in Flatfile.";
  //   case FileFeedEventType.SheetDeleted:
  //     return "A sheet was deleted in Flatfile.";
  //   case FileFeedEventType.RecordsCreated:
  //     return "A commit was created in Flatfile.";
  //   case FileFeedEventType.RecordsUpdated:
  //     return "A commit was updated in Flatfile.";
  //   case FileFeedEventType.RecordsDeleted:
  //     return "A commit was deleted in Flatfile.";
  //   case FileFeedEventType.CommitCreated:
  //     return "A commit was created in Flatfile.";
  //   case FileFeedEventType.CommitUpdated:
  //     return "A commit was updated in Flatfile.";
  //   case FileFeedEventType.CommitDeleted:
  //     return "A commit was deleted in Flatfile.";
  //   case FileFeedEventType.LayerCreated:
  //     return "A layer was created in Flatfile.";
  //   case FileFeedEventType.UploadCompleted:
  //     return "A file was created in Flatfile.";
  //   case FileFeedEventType.UploadUpdated:
  //     return "A file was updated in Flatfile.";
  //   case FileFeedEventType.UploadDeleted:
  //     return "A file was deleted in Flatfile.";
  //   case FileFeedEventType.FileCreated:
  //     return "A file was created in Flatfile.";
  //   case FileFeedEventType.FileUpdated:
  //     return "A file was updated in Flatfile.";
  //   case FileFeedEventType.FileDeleted:
  //     return "A file was deleted in Flatfile.";
  //   case FileFeedEventType.JobCreated:
  //     return "A job was created in Flatfile.";
  //   case FileFeedEventType.JobReady:
  //     return "A job was created in Flatfile.";
  //   case FileFeedEventType.JobUpdated:
  //     return "A job was updated in Flatfile.";
  //   case FileFeedEventType.JobCompleted:
  //     return "A job was completed in Flatfile.";
  //   case FileFeedEventType.JobOutcomeAcknowledged:
  //     return "A job outcome was acknowledged in Flatfile.";
  //   case FileFeedEventType.JobFailed:
  //     return "A job failed in Flatfile.";
  //   case FileFeedEventType.JobScheduled:
  //     return "A job was scheduled in Flatfile.";
  //   case FileFeedEventType.JobDeleted:
  //     return "A job was deleted in Flatfile.";
  //   case FileFeedEventType.AgentCreated:
  //     return "An agent was created in Flatfile.";
  //   case FileFeedEventType.AgentUpdated:
  //     return "An agent was updated in Flatfile.";
  //   case FileFeedEventType.AgentDeleted:
  //     return "An agent was deleted in Flatfile.";
  //   case FileFeedEventType.SpaceCreated:
  //     return "An space was created in Flatfile.";
  //   case FileFeedEventType.SpaceDeleted:
  //     return "An space was deleted in Flatfile.";
  //   default:
  //     return "An unknown event occurred.";
};
