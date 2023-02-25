import { Action } from "@prisma/client";
import { useState, FormEvent, useEffect } from "react";
import { ActionState } from "../../lib/action";
import { DateTime } from "luxon";

type Props = {
  action: Action;
};

const updateAction = async (action: Action): Promise<Action> => {
  const res = await fetch("/api/flatfile/process-filefeed-event", {
    method: "POST",
    body: JSON.stringify({
      actionId: action.id,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    return {
      ...action,
      metadata: {
        state: ActionState.Error,
        description: "An error occurred processing the event.",
      },
    };
  }

  const data = (await res.json()).data;

  return {
    ...data,
    createdAt: DateTime.fromISO(data.createdAt).toJSDate(),
  };
};

export const Event = ({ action }: Props) => {
  const [currentAction, setCurrentAction] = useState<Action>(action);

  const metadata = currentAction.metadata as {
    state: string;
    description: string;
  };

  useEffect(() => {
    if (metadata.state === ActionState.Initial) {
      setTimeout(() => {
        updateAction(action).then((a) => {
          setCurrentAction(a);
        });
      }, 5000);
    }
  }, []);

  return (
    <>
      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
        <div className="flex flex-row items-center">
          {metadata.state === ActionState.Initial && (
            <>
              <div className="blob pulse-blob bg-primary"></div>
              <span className="">Syncing...</span>
            </>
          )}
          {metadata.state === ActionState.Complete && (
            <>
              <div className="blob bg-green-800"></div>
              <span className="">Synced</span>
            </>
          )}
          {metadata.state === ActionState.Error && (
            <>
              <div className="blob bg-red-800"></div>
              <span className="">Error</span>
            </>
          )}
        </div>
      </td>

      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
        {metadata.state === ActionState.Complete && (
          <span className="">{metadata.description}</span>
        )}
      </td>

      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
        <span className="">
          {currentAction.createdAt &&
            DateTime.fromJSDate(currentAction.createdAt).toFormat(
              "MM/dd/yyyy hh:mm:ssa"
            )}
        </span>
      </td>
    </>
  );
};