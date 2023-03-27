import { Action } from "@prisma/client";
import { useState, FormEvent, useEffect } from "react";
import { ActionState, FileFeedEventType } from "../../lib/action";
import { DateTime } from "luxon";

type Props = {
  action: Action;
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

export const Event = ({ action }: Props) => {
  const metadata = action.metadata as {
    topic: string;
  };

  return (
    <>
      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
        <div className="flex flex-row items-center">
          {metadata.topic === FileFeedEventType.RecordsCreated && (
            <>
              <div className="blob bg-green-800"></div>
              <span className="">Records created</span>
            </>
          )}
          {metadata.topic === FileFeedEventType.RecordsUpdated && (
            <>
              <div className="blob bg-primary"></div>
              <span className="">Records updated</span>
            </>
          )}
          {metadata.topic === FileFeedEventType.RecordsDeleted && (
            <>
              <div className="blob bg-red-800"></div>
              <span className="">Records deleted</span>
            </>
          )}
        </div>
      </td>

      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
        <span className="">{descriptionForEventType(metadata.topic)}</span>
      </td>

      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
        <span className="">
          {action.createdAt &&
            DateTime.fromJSDate(action.createdAt).toFormat(
              "MM/dd/yyyy hh:mm:ssa"
            )}
        </span>
      </td>
    </>
  );
};
