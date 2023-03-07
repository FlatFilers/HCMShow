import { NextPageWithLayout } from "./_app";
import { useState, useCallback, useEffect } from "react";
import { useSpace, ISpaceConfig } from "@flatfile/react";
import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { getAccessToken } from "../lib/flatfile";
import { Action, PrismaClient, Space } from "@prisma/client";
import { DateTime } from "luxon";
import toast from "react-hot-toast";

interface Props {
  accessToken: string;
  environmentToken: string;
  existingSpace: Space;
  lastSyncAction?: Action;
}

const Embedded: NextPageWithLayout<Props> = ({
  accessToken,
  environmentToken,
  existingSpace,
  lastSyncAction,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>("Sync Records");
  const handleSubmit = (event: { preventDefault: () => void; target: any }) => {
    event.preventDefault();
    setIsSubmitting(true);
    setButtonText("Syncing records...");
    event.target.action = "/api/flatfile/sync-records";
    event.target.submit();
  };

  async function createSpace(event: {
    preventDefault?: () => void;
    target: any;
  }) {
    event.target.action = "/api/flatfile/create-embed-space";
    event.target.submit();
  }
  const handlePortalSubmit = async (event: {
    preventDefault: () => void;
    target: any;
  }) => {
    event.preventDefault();
    console.log("existingSpace", existingSpace);
    if (!existingSpace) {
      await createSpace(event);
    }
    setShowSpace(!showSpace);
  };
  const [showSpace, setShowSpace] = useState(false);
  const initialDocumentBody = `<div> 
  <h1 style="margin-bottom: 0px;">Welcome! Let's import your data.</h1>
  <p style="margin-top: 0px; margin-bottom: 12px;">Follow the steps below in order. Note: you can always return to this page by clicking "Welcome" in the left-hand sidebar.</p>
  <h2 style="margin-bottom: 0px;">1. Visit Files</h2>
  <p style="margin-top: 0px; margin-bottom: 8px;">Click "Files" in the left-hand sidebar. This is where you can upload files you want to import into Flatfile.</p>
  <h2 style="margin-bottom: 0px;">2. Upload the sample data</h2>
  <p style="margin-top: 0px; margin-bottom: 8px;">On the Files page, click "Add files" or drag-and-drop the sample data you downloaded previously onto the page.</p>
  <p style="margin-top: 0px; margin-bottom: 8px;">After the file uploads, click "Import" and follow the steps to completion to import the workbook.</p>
  <h2 style="margin-bottom: 0px;">3. Return to HCM.show</h2>
  <p style="margin-top: 0px; margin-bottom: 12px;">After uploading and importing the sample data, click the button below to return to HCM.show and click "Sync Records" to sync the data back into HCM.show.</p>`;

  type FlatfileSpaceData = {
    id: string;
    name: string;
    metadata: null;
    createdAt: string;
    guestLink: string;
    displayOrder: number;
    environmentId: string;
    spaceConfigId: string;
    createdByUserId: string;
    primaryWorkbookId: string;
  };

  const flatfileSpaceData = existingSpace?.flatfileData as FlatfileSpaceData;

  const spaceProps: ISpaceConfig = {
    accessToken: accessToken as string,
    environmentId: environmentToken as string,
    spaceId: flatfileSpaceData?.id,
    sidebarConfig: {
      showDataChecklist: false,
      showSidebar: false,
    },
    document: { title: "Welcome", body: initialDocumentBody },
  };
  const { error, data } = useSpace({ ...spaceProps });

  useCallback(() => {
    if (error) {
      setShowSpace(false);
    }
  }, [error]);

  const [downloaded, setDownloaded] = useState(false);
  const storageKey = "embedded-has-downloaded-sample-data";
  const sampleDataFileName = "/sample-hcm-employees.csv";

  useEffect(() => {
    if (localStorage.getItem(storageKey) === "true") {
      setDownloaded(true);
    }
  }, []);

  return (
    <div className="mx-12 flex flex-col justify-between mt-16 self-center">
      <p className="text-2xl mb-12">
        Your workspace is pre-configured and ready for use. 🎉{" "}
      </p>
      {!downloaded && (
        <div className="max-w-5xl mb-14">
          <div className="flex flex-row">
            <div className="max-w-lg">
              <div className="font-semibold mb-6 max-w-lg">Getting Started</div>
              <div className="mb-10">
                First, let's download some sample data. Click below to download.
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
                <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </div>
      )}
      {downloaded && (
        <div className="max-w-5xl mb-14">
          <div className="flex flex-row">
            <div className="min-w-[35%] flex flex-col justify-between">
              <div>
                <div className="font-semibold mb-6 max-w-lg">
                  {showSpace ? "Close portal" : "Connect to the portal"}
                </div>
                <div className="text-gray-600 mb-10 max-w-lg">
                  {showSpace
                    ? "Click below to disconnect the portal"
                    : "Click below to connect the embedded portal."}
                </div>
              </div>
              <div>
                <form onSubmit={handlePortalSubmit}>
                  <button
                    className={`px-4 py-2 inline-flex items-center justify-center rounded-md border text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto mt-14 mb-6 ${
                      showSpace
                        ? "bg-white text-primary border-2 border-primary"
                        : "bg-primary text-white border-transparent"
                    }`}
                  >
                    {showSpace ? "Close" : "Open"} Portal
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
                  </button>
                </form>
              </div>
            </div>

            <div className="border-r border-gray-300 mx-12"></div>

            <div className="flex flex-col justify-between">
              <div>
                <p className="font-semibold mb-6">Sync Records to HCM.show</p>
                <p className="text-gray-600 mb-6 max-w-lg">
                  After uploading records in Flatfile, click the button below to
                  sync the records into HCM.show.
                </p>
              </div>
              <div>
                <form
                  method="post"
                  onSubmit={handleSubmit}
                  className="mt-14 mb-6"
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

                {lastSyncAction && (
                  <p className="text-xs block text-gray-600 italic mt-2">
                    Last sync{" "}
                    {DateTime.fromJSDate(lastSyncAction.createdAt).toFormat(
                      "MM/dd/yy hh:mm:ss a"
                    )}
                  </p>
                )}
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

  const accessToken = await getAccessToken();
  const environmentToken = process.env.FLATFILE_ENVIRONMENT_ID;
  const spaceConfigId = process.env.ONBOARDING_SPACE_CONFIG_ID;
  const existingSpace = await prisma.space.findFirst({
    where: {
      userId: user.id,
    },
  });
  const lastSyncAction = await prisma.action.findFirst({
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
      spaceConfigId,
      existingSpace,
      lastSyncAction,
    },
  };
};

export default Embedded;
