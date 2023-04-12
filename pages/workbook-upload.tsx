import { Action, PrismaClient, Space } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { FormEvent, useState } from "react";
import { getToken } from "next-auth/jwt";
import { FlatfileSpaceData } from "../lib/flatfile";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "./_app";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { SpaceType } from "../lib/space";

interface Props {
  space?: Space;
  lastSyncedAt?: string;
}

const sampleDataFileName = "/hcm-sample-data.xlsx";

const Onboarding: NextPageWithLayout<Props> = ({ space, lastSyncedAt }) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  let defaultText = space ? "Sync Records" : "Setup Flatfile";
  const [buttonText, setButtonText] = useState<string>(defaultText);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    space
      ? setButtonText("Syncing records...")
      : setButtonText("Setting up Flatfile...");
  };

  const router = useRouter();

  useEffect(() => {
    if (router.query.flash === "success") {
      window.history.replaceState(null, "", "/workbook-upload");
      toast.success(router.query.message as string, {
        id: router.query.message as string,
        duration: 4000,
        style: {
          minWidth: "450px",
        },
      });
    } else if (router.query.flash === "error") {
      window.history.replaceState(null, "", "/workbook-upload");
      toast.error(router.query.message as string, { id: "error" });
    }
  }, []);

  interface Step {
    name: string;
    status: "current" | "upcoming" | "complete";
  }

  const initialSteps: Step[] = [
    {
      name: "Download Sample Data",
      status: "current",
    },
    {
      name: "Setup Flatfile",
      status: "upcoming",
    },
  ];

  const [steps, setSteps] = useState<Step[]>(initialSteps);

  const storageKey = "workbook-upload-has-downloaded-sample-data";

  useEffect(() => {
    if (!space && localStorage.getItem(storageKey) === "true") {
      setSteps([
        { ...steps[0], status: "complete" },
        { ...steps[1], status: "current" },
      ]);
    }
  }, []);

  return (
    <div className="ml-12 flex flex-row justify-between max-w-5xl mt-16">
      {!space && (
        <>
          {steps[0].status === "current" && (
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                Let's get ready to upload data into Flatfile.
              </h2>
              <p className="text-gray-600">
                First, download the sample data we'll import into Flatfile. 👇
              </p>
              <div className="mt-4 flex">
                <a
                  className="hover:text-white mb-12 inline-flex items-center justify-center rounded-md border text-primary border-primary px-4 py-2 text-sm font-medium shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto"
                  download={sampleDataFileName}
                  href={sampleDataFileName}
                  onClick={() => {
                    localStorage.setItem(storageKey, "true");

                    // set steps but change the status of the current step
                    setSteps([
                      { ...steps[0], status: "complete" },
                      { ...steps[1], status: "current" },
                    ]);
                  }}
                >
                  Download sample data
                </a>
              </div>
            </div>
          )}

          {steps[1].status === "current" && (
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                🎉 Great! Now let's setup Flatfile to import those records.
              </h2>
              <p className="text-gray-600 mb-4">
                Click the button below and we'll configure the upload space and
                invite you to it. 👇
              </p>
              <form
                action="/api/flatfile/create-space"
                onSubmit={handleSubmit}
                className="mb-8"
              >
                <button
                  onClick={() => toast.loading("Setting up Flatfile")}
                  disabled={isSubmitting}
                  className={`${
                    isSubmitting
                      ? "bg-primary-dark hover:cursor-not-allowed"
                      : "bg-primary hover:bg-primary-dark "
                  } inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto}`}
                  type="submit"
                >
                  {buttonText}
                </button>
              </form>

              <p className="text-xs block text-gray-600">
                To download the sample data again{" "}
                <a
                  className="underline text-primary"
                  download={sampleDataFileName}
                  href={sampleDataFileName}
                >
                  click here.
                </a>
              </p>
            </div>
          )}

          <nav className="flex justify-center" aria-label="Progress">
            <ol role="list" className="space-y-6">
              {steps.map((step) => (
                <li key={step.name}>
                  {step.status === "complete" ? (
                    <a className="group">
                      <span className="flex items-start">
                        <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
                          <CheckCircleIcon
                            className="h-full w-full text-primary"
                            aria-hidden="true"
                          />
                        </span>
                        <span className="ml-3 text-sm font-medium text-gray-500">
                          {step.name}
                        </span>
                      </span>
                    </a>
                  ) : step.status === "current" ? (
                    <a className="flex items-start" aria-current="step">
                      <span
                        className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center"
                        aria-hidden="true"
                      >
                        <span className="absolute h-4 w-4 rounded-full bg-blue-200" />
                        <span className="relative block h-2 w-2 rounded-full bg-primary" />
                      </span>
                      <span className="ml-3 text-sm font-medium text-primary">
                        {step.name}
                      </span>
                    </a>
                  ) : (
                    <a className="group">
                      <div className="flex items-start">
                        <div
                          className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center"
                          aria-hidden="true"
                        >
                          <div className="h-2 w-2 rounded-full bg-gray-300" />
                        </div>
                        <p className="ml-3 text-sm font-medium text-gray-500">
                          {step.name}
                        </p>
                      </div>
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </>
      )}

      {space && (
        <div>
          <p className="text-2xl mb-8">Your workspace is configured. 🎉 </p>

          <div className="flex flex-row justify-between">
            <div>
              <p className="font-semibold mb-2">Upload Records in Flatfile</p>
              <p className="text-gray-600 mb-2 max-w-lg">
                Click the button below to go to your space and receive a sign-in
                link in your inbox.
              </p>
              <p className="text-gray-600 mb-2 max-w-lg">
                Once inside the space, upload the sample data you downloaded
                previously.
              </p>
              <p className="text-gray-600 mb-6 max-w-lg">
                After uploading, return back here to HCM.show to sync the
                records into the app.
              </p>

              <a
                target="_blank"
                href={
                  (space.flatfileData as unknown as FlatfileSpaceData).guestLink
                }
                className="inline-flex flex-row items-center justify-between mb-8 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Visit Workspace
                <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
              </a>

              <p className="text-xs block text-gray-600">
                To download the sample data again{" "}
                <a
                  className="underline text-primary"
                  download={sampleDataFileName}
                  href={sampleDataFileName}
                >
                  click here.
                </a>
              </p>
            </div>

            <div className="border-r border-gray-300 mx-16"></div>

            <div>
              <p className="font-semibold mb-2">Sync Records to HCM.show</p>
              <p className="text-gray-600 mb-6 max-w-lg">
                After uploading records in Flatfile, click the button below to
                sync the records into HCM.show.
              </p>

              <form
                action="/api/flatfile/sync-records"
                method="post"
                onSubmit={handleSubmit}
              >
                <button
                  onClick={() => toast.loading("Syncing...")}
                  disabled={isSubmitting}
                  type="submit"
                  className={`${
                    isSubmitting
                      ? "bg-primary-dark hover:cursor-not-allowed"
                      : "bg-primary hover:bg-primary-dark "
                  } inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto}`}
                >
                  {buttonText}
                  <ArrowPathIcon className="w-4 h-4 ml-1" />
                </button>
              </form>

              {lastSyncedAt && (
                <p className="text-xs block text-gray-600 italic mt-2">
                  Last sync {lastSyncedAt}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = await getToken({
    req: context.req,
  });
  // console.log("gSSP token", token);

  if (!token) {
    console.log("No session token found");

    return {
      notFound: true,
    };
  }

  const prisma = new PrismaClient();
  const space = await prisma.space.findUnique({
    where: {
      userId_type: {
        userId: token.sub as string,
        type: SpaceType.WorkbookUpload,
      },
    },
  });

  if (!space) {
    return {
      props: {},
    };
  }

  const lastSyncAction = await prisma.action.findFirst({
    where: {
      organizationId: token.organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let lastSyncedAt;

  if (lastSyncAction) {
    lastSyncedAt = DateTime.fromJSDate(lastSyncAction.createdAt).toFormat(
      "MM/dd/yy hh:mm:ss a"
    );
  }

  return {
    props: { space, lastSyncedAt },
  };
};

export default Onboarding;
