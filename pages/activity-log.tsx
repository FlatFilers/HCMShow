import { GetServerSideProps, NextPage } from "next";
import { useEffect, useState } from "react";
import { getToken } from "next-auth/jwt";
import { ActionType, getActions } from "../lib/action";
import { Action, User } from "@prisma/client";
import { DateTime } from "luxon";
import { TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

const mapActionTypeToLabel = (type: string) => {
  const mappings = {
    [ActionType.SyncRecords]: "Sync Records",
    [ActionType.FileFeedEvent]: "File Feed Event",
  };

  return mappings[type as ActionType];
};

interface Props {
  actions: (Action & { user: User })[];
}

const ActivityLog: NextPage<Props> = ({ actions }) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>("Delete All Records");
  const handleSubmit = () => {
    setIsSubmitting(true);
    setButtonText("Clearing Records...");
  };
  const router = useRouter();

  useEffect(() => {
    if (router.query.flash === "success") {
      window.history.replaceState(null, "", "/activity-log");
      toast.success(router.query.message as string, {
        id: router.query.message as string,
        duration: 4000,
      });
    } else if (router.query.message === "Failed to clear database") {
      window.history.replaceState(null, "", "/activity-log");
      toast.error("Failed to clear database", {
        id: router.query.message as string,
      });
    }
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="w-full flex flex-row justify-between items-center mb-8">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">
              Activity Log
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Your activity history from Flatfile will show here.
            </p>
          </div>
          <form
            method="post"
            action="/api/purge-records"
            onSubmit={handleSubmit}
            className="mt-14 mb-6"
          >
            <button
              onClick={() => toast.loading("Deleting records...")}
              disabled={isSubmitting}
              type="submit"
              className={`${
                isSubmitting ? "hover:cursor-not-allowed" : "hover:bg-red-600 "
              } bg-red-500 inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 sm:w-auto}`}
            >
              {buttonText}
              <TrashIcon className="w-4 h-4 ml-1" />
            </button>
          </form>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Action
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {actions &&
                    actions.length > 0 &&
                    actions.map((a) => {
                      return (
                        <tr key={a.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {mapActionTypeToLabel(a.type)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {a.user.email}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {DateTime.fromJSDate(a.createdAt).toFormat(
                              "MM/dd/yy hh:mm:ss a"
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {a.type === ActionType.SyncRecords && a.description}
                            {a.type === ActionType.FileFeedEvent &&
                              (a.metadata as { description: string })
                                .description}
                          </td>
                        </tr>
                      );
                    })}

                  {(!actions || actions.length === 0) && (
                    <tr>
                      <td className="py-4 pl-4 pr-3 text-sm text-gray-400 sm:pl-6">
                        No actions taken yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = await getToken({
    req: context.req,
  });

  if (!token?.sub) {
    console.log("No session");
    return {
      notFound: true,
    };
  }

  const actions = await getActions(token.organizationId);

  return {
    props: {
      actions,
    },
  };
};

export default ActivityLog;
