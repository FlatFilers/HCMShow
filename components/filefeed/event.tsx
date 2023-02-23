import { Action } from "@prisma/client";
import { useState, FormEvent, useEffect } from "react";
import toast from "react-hot-toast";

type Props = {
  action: Action;
};

export const Event = ({ action }: Props) => {
  const state = (action.metadata as { state: string }).state;

  // todo useEffect here to update state
  useEffect(() => {
    console.log("action", action);
  }, []);

  return (
    <div className="flex flex-row items-center">
      {state === "initial" && (
        <>
          <div className="blob pulse-blob bg-primary"></div>
          <span className="">Syncing...</span>
        </>
      )}
      {state === "complete" && (
        <>
          <div className="blob bg-green-800"></div>
          <span className="">Synced</span>
        </>
      )}
      {state === "error" && (
        <>
          <div className="blob bg-red-800"></div>
          <span className="">Error</span>
        </>
      )}
    </div>
  );
};
