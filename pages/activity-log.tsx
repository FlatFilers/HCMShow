import { GetServerSideProps, NextPage } from "next";
import React from "react";
import { getToken } from "next-auth/jwt";
import { ActionType, getActions } from "../lib/action";
import { Action, User } from "@prisma/client";
import { DateTime } from "luxon";

const mapActionTypeToLabel = (type: string) => {
  const mappings = {
    [ActionType.SyncRecords]: "Sync Records",
  };

  return mappings[type as ActionType];
};

interface Props {
  actions: (Action & { user: User })[];
}

const ActivityLog: NextPage<Props> = ({ actions }) => {
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
                            {a.description}
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