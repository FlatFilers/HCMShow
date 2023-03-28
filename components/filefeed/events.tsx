import { Action } from "@prisma/client";
import { useState, FormEvent, useEffect } from "react";
import toast from "react-hot-toast";

import { Event } from "./event";
import { DateTime } from "luxon";
import { GetFileFeedActionsResult } from "../../pages/api/flatfile/get-filefeed-actions";

type Props = {
  initialActions: Action[];
};

export const Events = ({ initialActions }: Props) => {
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
      <p className="text-2xl mb-2">Ready and listening for files. 🎉 </p>

      <p className="text-gray-600 mb-4 max-w-lg">
        As new records are created or updated in Flatfile those events will
        populate here.
      </p>

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
