import { GetServerSideProps, NextPage } from "next";
import React, { FormEvent, useEffect, useState, useRef } from "react";
import { getToken } from "next-auth/jwt";
import { ActionType, getActions, SerializeableAction } from "../lib/action";
import { Action, User } from "@prisma/client";
import { DateTime } from "luxon";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/outline";
import { useFlashMessages } from "../lib/hooks/usehooks";

const mapActionTypeToLabel = (type: string) => {
  const mappings = {
    [ActionType.SyncRecords]: "Sync Records",
    [ActionType.FileFeedEvent]: "File Feed Event",
    [ActionType.SyncOnboardingRecords]: "Sync Project Onboarding Records",
    [ActionType.SyncEmbedRecords]: "Sync Embedded Records",
    [ActionType.SyncFilefeedRecords]: "Sync File Feed Records",
    [ActionType.SyncDynamicRecords]: "Sync Dynamic Records",
  };

  return mappings[type as ActionType];
};

interface Props {
  actions: SerializeableAction[];
}

const ActivityLog: NextPage<Props> = ({ actions }) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>("Reset Account");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (confirm("Are you sure you want to reset your account?")) {
      setIsSubmitting(true);
      setButtonText("Resetting Account...");
      toast.loading("Resetting Account...");
      localStorage.clear();
      if (formRef.current) {
        formRef.current.submit();
      }
    }
  };

  const router = useRouter();

  useFlashMessages(router.query, "/activity-log");

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="w-full flex flex-row justify-between mb-8">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">
              Activity Log
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Your activity history from Flatfile will show here.
            </p>
          </div>
          <form
            ref={formRef}
            action="/api/v1/reset-account"
            method="post"
            onSubmit={handleSubmit}
          >
            <button
              disabled={isSubmitting}
              type="submit"
              className={`${
                isSubmitting
                  ? "hover:cursor-not-allowed"
                  : "hover:bg-red-600 hover:text-white"
              } bg-white inline-flex items-center justify-center rounded-xl border border-red-600 px-12 py-2 text-base text0 font-medium text-red-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 sm:w-auto}`}
            >
              {buttonText}
              <ArrowPathRoundedSquareIcon className="w-5 h-5 ml-2" />
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
                            {a.createdAt}
                          </td>
                          <td className="capitalize whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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

  const dbActions = await getActions(token.organizationId);

  const actions = dbActions.map((action) => {
    return {
      id: action.id,
      type: action.type,
      createdAt: DateTime.fromJSDate(action.createdAt).toFormat(
        "MM/dd/yy hh:mm:ss a"
      ),
      description: action.description,
      metadata: action.metadata,
      user: {
        email: action.user.email,
      },
    };
  });

  return {
    props: {
      actions,
    },
  };
};

export default ActivityLog;
