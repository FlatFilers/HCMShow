import { Action, Space } from "@prisma/client";
import { useState, FormEvent, useEffect } from "react";
import toast from "react-hot-toast";

import { Event } from "./event";
import { DateTime } from "luxon";
import { GetFileFeedActionsResult } from "../../pages/api/flatfile/get-filefeed-actions";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

type Props = {
  urlToSpace: string;
  initialActions: Action[];
};

export const Events = ({ urlToSpace, initialActions }: Props) => {
  const [actions, setActions] = useState<Action[]>(initialActions);

  useEffect(() => {
    const timer = setInterval(() => {
      fetch("/api/flatfile/get-filefeed-actions").then((res) => {
        res.json().then((res: { actions: any[] }) => {
          console.log("data", res);

          const data = res.actions.map((action) => {
            return {
              ...action,
              createdAt: DateTime.fromISO(action.createdAt).toJSDate(),
            };
          });
          setActions(data);
        });
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-5xl">
      <p className="text-2xl mb-2">Ready and listening for events. 🎉 </p>

      <p className="text-gray-600 mb-2 max-w-lg">
        A file has been uploaded to your Flatfile space.
      </p>

      <p className="text-gray-600 mb-4 max-w-lg">
        As new records are created or updated in Flatfile those events will
        populate here.
      </p>

      <a
        target="_blank"
        href={urlToSpace}
        className="inline-flex flex-row items-center justify-between mb-8 rounded-md border text-primary border-primary px-4 py-2 text-sm font-medium shadow-sm hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Visit Workspace
        <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
      </a>

      <div className="border-1 border border-gray-100 my-6"></div>

      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="w-20 py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900"
            >
              Event
            </th>
            <th
              scope="col"
              className="w-48 px-6 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Description
            </th>
            <th
              scope="col"
              className="w-48 px-6 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              When
            </th>
          </tr>
        </thead>
        <tbody>
          {actions.map((a, i) => {
            return (
              <tr key={i}>
                <Event action={a} />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
