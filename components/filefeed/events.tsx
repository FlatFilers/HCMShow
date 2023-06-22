import { useState, useEffect } from "react";
import { Event } from "./event";
import {
  ArrowTopRightOnSquareIcon,
  BoltIcon,
  ExclamationCircleIcon,
  PuzzlePieceIcon,
  SparklesIcon,
  VariableIcon,
} from "@heroicons/react/24/outline";
import { FileFeedEvent, fileFeedEventFromAction } from "../../lib/action";
import FeaturesList from "../shared/features-list";
import GoToSpace from "../shared/go-to-space";

const features = {
  "Event-based workflow": ExclamationCircleIcon,
  "Plug-in functionality": PuzzlePieceIcon,
  "Custom actions": BoltIcon,
  "External API calls": ArrowTopRightOnSquareIcon,
  "Custom Theming": VariableIcon,
  "Data Hooks": SparklesIcon,
};

type Props = {
  flatfileSpaceId: string;
  initialEvents: FileFeedEvent[];
};

export const Events = ({ flatfileSpaceId, initialEvents }: Props) => {
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
    <div className="flex flex-row justify-between">
      <div>
        <p className="text-2xl mb-2">Ready and listening for events. 🎉 </p>
        <p className="text-gray-600 mb-2 max-w-lg">
          Congratulations! A Flatfile space has been configured and we’ve been
          able to pick up a file from a vendor for you!
        </p>
        <p className="text-gray-600 mb-2 max-w-lg">
          Click the "Visit Flatfile Space" button below to access your dedicated
          space in Flatfile.
        </p>
        <p className="text-gray-600 mb-2 max-w-lg">
          As new records are created or updated in Flatfile, events will appear
          in real-time on this page. These events will include information such
          as the event type, description, and when the event occurred.
        </p>
        <p className="text-gray-600 mb-6 max-w-lg text-xs">
          You can view the file uploaded to your space from Google Drive{" "}
          <a
            className="underline text-file-feed"
            href="https://drive.google.com/file/d/1Gmbvhra7xIhs0gDqZHjHELgyViq4VwD9/view?usp=share_link"
          >
            here.
          </a>
        </p>

        <GoToSpace workflow="filefeed" flatfileSpaceId={flatfileSpaceId}>
          <button className="inline-flex flex-row items-center justify-between mb-8 rounded-md border text-file-feed border-file-feed px-4 py-2 text-sm font-semibold hover:bg-file-feed hover:text-white">
            Visit Flatfile Space
            <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
          </button>
        </GoToSpace>

        <div className="border-1 border border-gray-100 mt-6"></div>
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="w-64 py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900"
              >
                Event
              </th>
              <th
                scope="col"
                className="w-64 px-6 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                When
              </th>
            </tr>
          </thead>
          <tbody>
            {!events ||
              (events.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="text-gray-600 text-sm py-4 text-center"
                  >
                    No events yet
                  </td>
                </tr>
              ))}

            {events &&
              events.length > 0 &&
              events.map((a, i) => {
                return (
                  <tr key={i}>
                    <Event event={a} />
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <FeaturesList
        type="file-feed"
        githubUrl="https://github.com/FlatFilers/hcm-show-config/blob/main/workflows/filefeed/index.ts"
        features={features}
      />
    </div>
  );
};
