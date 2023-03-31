import { useState, useEffect } from "react";
import { Event } from "./event";
import { DateTime } from "luxon";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { FileFeedEvent, fileFeedEventFromAction } from "../../lib/action";

type Props = {
  urlToSpace: string;
  initialEvents: FileFeedEvent[];
};

export const Events = ({ urlToSpace, initialEvents }: Props) => {
  const [events, setEvents] = useState<FileFeedEvent[]>(initialEvents);

  useEffect(() => {
    const timer = setInterval(() => {
      fetch("/api/flatfile/get-filefeed-actions").then((res) => {
        res.json().then((res: { actions: any[] }) => {
          console.log("data", res);

          const data = res.actions.map((a) => fileFeedEventFromAction(a));
          setEvents(data);
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

      <p className="text-gray-600 mb-2 max-w-lg">
        Visit your space by clicking the button below. Import the file that is
        waiting there ready to be imported.
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
          {events.map((a, i) => {
            return (
              <tr key={i}>
                <Event event={a} />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
