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

interface Props {
  accessToken: string;
  environmentToken: string;
  lastSyncedAt?: string;
  existingSpace: Space;
}

const Embedded: NextPageWithLayout<Props> = ({
  accessToken,
  environmentToken,
  lastSyncedAt,
  existingSpace,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>("Sync Records");
  const handleSubmit = () => {
    setIsSubmitting(true);
    setButtonText("Syncing records...");
  };

  const flatfleSpace =
    existingSpace?.flatfileData as unknown as FlatfileSpaceData;
  const [showSpace, setShowSpace] = useState(false);
  const spaceProps = {
    accessToken: accessToken as string,
    environmentId: environmentToken as string,
    spaceId: flatfleSpace?.id as string,
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

  useEffect(() => {
    if (localStorage.getItem(storageKey) === "true") {
      setDownloaded(true);
    }

    if (router.query.flash === "success") {
      window.history.replaceState(null, "", "/embedded");
      toast.success(router.query.message as string, {
        id: router.query.message as string,
        duration: 4000,
      });
    } else if (router.query.flash === "error") {
      window.history.replaceState(null, "", "/embedded");
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

  return (
    <div className="mx-12 flex flex-col justify-between mt-16 self-center">
      {!downloaded && (
        <div className="max-w-7xl">
          <p className="text-2xl mb-12">
            Let's get ready to upload data into Flatfile.
          </p>
          <div className="w-[35%] mb-14">
            <div className="flex flex-row">
              <div className="max-w-lg">
                <div className="font-semibold mb-6 max-w-lg">
                  Getting Started
                </div>
                <div className="mb-10">
                  First, let's download some sample data. Click below to
                  download.
                </div>
                <a
                  className="bg-primary text-white px-4 py-2 mb-6 inline-flex items-center justify-center rounded-md border border-transparent text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto"
                  download={sampleDataFileName}
                  href={sampleDataFileName}
                  onClick={() => {
                    localStorage.setItem(storageKey, "true");
                    setDownloaded(true);
                  }}
                >
                  Download
                  <ArrowDownTrayIcon className="w-4 h-4 ml-2" />
                </a>
              </div>
              <div className="border-r border-gray-300"></div>
            </div>
          </div>
        </div>
      )}
      {downloaded && !existingSpace && (
        <div className="max-w-7xl">
          <p className="text-2xl mb-12">Let's customize a space for you</p>
          <div className="w-[35%] mb-14">
            <div className="flex flex-row justify-between">
              <div>
                <div>
                  <div className="font-semibold mb-6 max-w-lg">
                    Create a space
                  </div>
                  <div className="text-gray-600 mb-10 max-w-lg">
                    Next, let's configure a space to work with. Click below to
                    create a flatfile space
                  </div>
                </div>
                <div>
                  <form action="/api/flatfile/create-embed-space">
                    <button
                      onClick={() => toast.loading("Creating a space...")}
                      className="px-4 py-2 inline-flex items-center justify-center rounded-md border text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto mb-6 bg-primary text-white border-transparent"
                    >
                      Create Space
                      <SparklesIcon className="w-4 h-4 ml-2" />
                    </button>
                  </form>
                </div>
              </div>
              <div className="border-r border-gray-300"></div>
            </div>
          </div>
        </div>
      )}
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
                      className={`px-4 py-2 inline-flex items-center justify-center rounded-md border text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto mt-4 ${
                        showSpace
                          ? "bg-white text-primary border-2 border-primary"
                          : "bg-primary text-white border-transparent"
                      }`}
                    >
                      {showSpace ? "Close Portal" : "Import Benefit Elections"}
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
    },
  };
};

export default Embedded;
