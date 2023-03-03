import { NextPageWithLayout } from "./_app";
import { useState, useCallback } from "react";
import { useSpace, ISpaceConfig } from "@flatfile/react";
import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { getAccessToken } from "../lib/flatfile";

interface Props {
  accessToken: string;
  environmentToken: string;
  spaceConfigId: string;
}

const Embedded: NextPageWithLayout<Props> = ({
  accessToken,
  environmentToken,
  spaceConfigId,
}) => {
  const [showSpace, setShowSpace] = useState(false);
  const spaceProps: ISpaceConfig = {
    accessToken: accessToken as string,
    environmentId: environmentToken as string,
    spaceConfigId: spaceConfigId,
    sidebarConfig: {
      showDataChecklist: false,
    },
  };
  const { error, data } = useSpace({ ...spaceProps });
  const sampleDataFileName = "/sample-hcm-employees.csv";

  useCallback(() => {
    if (error) {
      setShowSpace(false);
    }
  }, [error]);
  return (
    <div className="mx-12 flex flex-col justify-between mt-16 self-center">
      <p className="text-2xl mb-8">
        Your workspace is pre-configured and ready for use. 🎉{" "}
      </p>
      {!showSpace && (
        <div className="max-w-5xl mb-14">
          <div className="flex flex-row justify-around">
            <div>
              <div className="font-semibold mb-6 max-w-lg">Getting Started</div>
              <div className="mb-10">
                First, let's download some sample data. Click below to download.
              </div>
              <a
                className="bg-primary text-white px-4 py-2 mb-6 inline-flex items-center justify-center rounded-md border border-transparent text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto"
                download={sampleDataFileName}
                href={sampleDataFileName}
              >
                Download
                <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
              </a>
            </div>

            <div className="border-r border-gray-300 mx-16"></div>

            <div>
              <div className="font-semibold mb-6 max-w-lg">
                Connect to the portal
              </div>
              <div className="text-gray-600 mb-10 max-w-lg">
                Then, click below to connect the embedded portal.
              </div>
              <button
                className="bg-primary text-white px-4 py-2 inline-flex items-center justify-center rounded-md border border-transparent text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto"
                onClick={() => setShowSpace(!showSpace)}
              >
                {showSpace ? "Close" : "Open"} Portal
                <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}
      {error && <div>{error}</div>}
      {!error && showSpace && (
        <div>
          <div className="max-w-7xl mb-14">
            <div className="flex flex-row justify-around">
              <div>
                <div className="mb-4 font-semibold">Let's import your data</div>
                <div className="text-xs block text-gray-600 ml-2 mb-6">
                  To download the sample data again{" "}
                  <a
                    className="underline text-primary"
                    download={sampleDataFileName}
                    href={sampleDataFileName}
                  >
                    click here.
                  </a>
                </div>
                <div className="mb-2">1. Visit Files</div>
                <p className="mb-6">
                  Click "Files" in the left-hand sidebar. This is where you can
                  upload files you want to import into Flatfile.
                </p>
                <div className="mb-2">2. Upload the sample data</div>
                <p className="mb-2">
                  On the Files page, click "Add files" or drag-and-drop the
                  sample data you downloaded previously onto the page.
                </p>
                <p>
                  After the file uploads, click "Import" and follow the steps to
                  completion to import the workbook.
                </p>
              </div>

              <div className="border-r border-gray-300 mx-16"></div>

              <div className="flex flex-col justify-between">
                <div>
                  <p className="font-semibold mb-2">Sync Records to HCM.show</p>
                  <p className="text-gray-600 mb-6 max-w-lg">
                    After uploading records in Flatfile, click the button below
                    to sync the records into HCM.show.
                  </p>
                </div>
                <div>
                  <button
                    type="submit"
                    className=" bg-slate-400 hover:cursor-not-allowed inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto mb-16"
                  >
                    Sync Records
                    <ArrowPathIcon className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>

              <div className="border-r border-gray-300 mx-16"></div>

              <div className="flex flex-col justify-between min-w-[25%]">
                <div>
                  <div className="font-semibold mb-2 max-w-lg">
                    Close portal
                  </div>
                  <div>Click below to disconnect the portal</div>
                </div>
                <div>
                  <button
                    className="bg-primary text-white px-4 py-2 inline-flex items-center justify-center rounded-md border border-transparent text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto mb-16"
                    onClick={() => setShowSpace(!showSpace)}
                  >
                    {showSpace ? "Close" : "Open"} Portal
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
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

  const accessToken = await getAccessToken();
  const environmentToken = process.env.FLATFILE_ENVIRONMENT_ID;
  const spaceConfigId = process.env.ONBOARDING_SPACE_CONFIG_ID;

  return {
    props: { accessToken, environmentToken, spaceConfigId },
  };
};

export default Embedded;
