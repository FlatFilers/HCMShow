import { NextPageWithLayout } from "./_app";
import { useState, useCallback, useEffect } from "react";
import { useSpace } from "@flatfile/react";
import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import {
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  PencilIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { getAccessToken } from "../lib/flatfile";
import { Action, PrismaClient, Space } from "@prisma/client";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import { SpaceType } from "../lib/space";
import { FlatfileSpaceData } from "../lib/flatfile";
import { useRouter } from "next/router";
import { workflowItems } from "../components/sidebar-layout";
import DownloadFile from "../components/shared/download-file";
import SetupSpace from "../components/shared/setup-space";
import StepList, { Step } from "../components/shared/step-list";

interface Props {
  accessToken: string;
  environmentToken: string;
  lastSyncedAt?: string;
  existingSpace: Space;
  userId: string;
}

const EmbeddedPortal: NextPageWithLayout<Props> = ({
  accessToken,
  environmentToken,
  lastSyncedAt,
  existingSpace,
  userId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>("Setup Flatfile");
  const handleSubmit = () => {
    setIsSubmitting(true);
    setButtonText("Setting up Flatfile...");
  };

  const flatfleSpace =
    existingSpace?.flatfileData as unknown as FlatfileSpaceData;
  const [showSpace, setShowSpace] = useState(false);
  const spaceProps = {
    accessToken: accessToken as string,
    environmentId: environmentToken as string,
    spaceId: flatfleSpace?.id as string,
    // TODO: This may change in the future as the SDK evolves.
    // These metadata properties are setup in an odd way.
    spaceInfo: {
      userId,
    },
    sidebarConfig: {
      showDataChecklist: false,
      showSidebar: false,
    },
  };
  const { error, data } = useSpace({ ...spaceProps });

  useCallback(() => {
    if (error) {
      setShowSpace(false);
    }
  }, [error]);

  const [downloaded, setDownloaded] = useState(false);
  const storageKey = "embedded-has-downloaded-sample-data";
  const sampleDataFileName = "/HCM.show benefits sample data.csv";

  const router = useRouter();

  const embeddedItem = workflowItems(router).find(
    (i) => i.slug === "embedded-portal"
  )!;

  useEffect(() => {
    if (localStorage.getItem(storageKey) === "true") {
      setDownloaded(true);
    }

    if (router.query.flash === "success") {
      window.history.replaceState(null, "", embeddedItem.href);
      toast.success(router.query.message as string, {
        id: router.query.message as string,
        duration: 4000,
      });
    } else if (router.query.flash === "error") {
      window.history.replaceState(null, "", embeddedItem.href);
      toast.error(router.query.message as string, { id: "error" });
    }
  }, []);

  const [currentTime, setCurrentTime] = useState<DateTime>();

  useEffect(() => {
    if (!showSpace) {
      return;
    }

    const timer = setInterval(() => {
      fetch(
        `/api/flatfile/get-embed-actions?afterTimestamp=${currentTime?.toISO()}`
      ).then((res) => {
        res.json().then((res: { actions: any[] }) => {
          console.log("data", res);

          res.actions.forEach((a) => {
            toast.success(a.description, {
              id: DateTime.now().toISO(),
              duration: 4000,
            });
          });
        });
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [showSpace]);

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

  return (
    <div className="mx-12 mt-16 self-center">
      <div className="mb-12">
        <div className={`border-t-[6px] w-12 mb-2 ${embeddedItem.color}`}></div>
        <p className="text-sm font-semibold">{embeddedItem.name}</p>
      </div>

      {!existingSpace && (
        <div className="flex flex-row justify-between">
          {steps[0].status === "current" && (
            <DownloadFile
              type="embedded-portal"
              fileName={sampleDataFileName}
              onClick={() => {
                localStorage.setItem(storageKey, "true");

                // set steps but change the status of the current step
                setSteps([
                  { ...steps[0], status: "complete" },
                  { ...steps[1], status: "current" },
                ]);
              }}
            />
          )}

          {steps[1].status === "current" && (
            <SetupSpace
              fileName={sampleDataFileName}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              buttonText={buttonText}
              actionHref="/api/flatfile/create-embed-space"
              type="embedded-portal"
            />
          )}

          <StepList type="embedded-portal" steps={steps} />
        </div>
      )}

      <div className="flex flex-col justify-between ">
        {downloaded && existingSpace && (
          <div className="max-w-7xl">
            <p className="text-2xl mb-12">
              Your workspace is configured and ready for use. 🎉{" "}
            </p>
            <div className="w-full mb-14">
              <div className="flex flex-row">
                <div className="">
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="font-semibold mb-6">
                        Connect to the portal
                      </div>
                      <div className="text-gray-600 mb-1">
                        {showSpace
                          ? "Click below to disconnect the portal."
                          : "Click below to import benefit elections."}
                      </div>

                      <p className="text-xs text-gray-600 mb-10">
                        Need the sample data?
                        <a
                          className="ml-1 underline"
                          download={sampleDataFileName}
                          href={sampleDataFileName}
                          onClick={() => {
                            localStorage.setItem(storageKey, "true");
                          }}
                        >
                          Click here to download it again.
                        </a>
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          // When the space is opened, save the time we started listening for events
                          if (showSpace === false) {
                            setCurrentTime(DateTime.now().toUTC());
                          }

                          setShowSpace(!showSpace);
                        }}
                        className={`px-4 py-2 inline-flex items-center justify-center rounded-md border text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-embedded-portal focus:ring-offset-2 sm:w-auto mt-4 ${
                          showSpace
                            ? "bg-white text-embedded-portal border-2 border-embedded-portal"
                            : "bg-embedded-portal text-white border-transparent"
                        }`}
                      >
                        {showSpace
                          ? "Close Portal"
                          : "Import Benefit Elections"}
                        {showSpace ? (
                          <ArrowsPointingInIcon className="w-4 h-4 ml-2" />
                        ) : (
                          <ArrowsPointingOutIcon className="w-4 h-4 ml-2" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && <div>{error}</div>}
        {!error && showSpace && (
          <div>
            <div>{data?.component}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = await getToken({
    req: context.req,
  });

  if (!token) {
    console.log("No session token found");

    return {
      notFound: true,
    };
  }

  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({
    where: {
      id: token.sub,
    },
  });

  if (!user) {
    throw new Error("No user found");
  }

  const existingSpace = await prisma.space.findUnique({
    where: {
      userId_type: {
        userId: token.sub as string,
        type: SpaceType.Embed,
      },
    },
    select: {
      flatfileData: true,
    },
  });

  // console.log("existingSpace", existingSpace);

  const accessToken = await getAccessToken({
    clientId: process.env.EMBEDDED_CLIENT_ID as string,
    secret: process.env.EMBEDDED_CLIENT_SECRET as string,
  });
  const environmentToken = process.env.EMBEDDED_ENVIRONMENT_ID;
  const lastSync = await prisma.action.findFirst({
    where: {
      organizationId: token.organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    props: {
      accessToken,
      environmentToken,
      lastSyncedAt: lastSync
        ? DateTime.fromJSDate(lastSync.createdAt).toFormat(
            "MM/dd/yy hh:mm:ss a"
          )
        : "",
      existingSpace,
      userId: user.id,
    },
  };
};

export default EmbeddedPortal;
