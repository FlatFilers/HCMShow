import { NextPageWithLayout } from "./_app";
import { useState, useCallback } from "react";
import { useSpace, ISpaceConfig } from "@flatfile/react";
import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import { config } from "../lib/embed_flatfile_config";
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { getAccessToken } from "../lib/flatfile";

interface Props {
  accessToken: string;
  environmentToken: string;
}

const Embedded: NextPageWithLayout<Props> = ({
  accessToken,
  environmentToken,
}) => {
  const [showSpace, setShowSpace] = useState(false);
  const spaceProps: ISpaceConfig = {
    accessToken: accessToken as string,
    environmentId: environmentToken as string,
    spaceConfig: config,
    sidebarConfig: {
      showDataChecklist: false,
    },
  };
  const { error, data } = useSpace({ ...spaceProps });

  useCallback(() => {
    if (error) {
      setShowSpace(false);
    }
  }, [error]);
  return (
    <div className="mx-12 flex flex-col justify-between mt-16 self-center">
      <div className="max-w-5xl mb-16">
        <p className="text-2xl mb-8">
          Your workspace is pre-configured and ready for use. 🎉{" "}
        </p>

        <div className="flex flex-row justify-around mb-10">
          <div>
            <p className="font-semibold text-gray-600 mb-2 max-w-lg">
              Click below to connect the embedded portal
            </p>
            <p className="mb-6">
              Then, follow the instructions below to import your data.
            </p>
            <button
              className="bg-primary text-white px-4 py-2 rounded-lg flex flex-row items-center"
              onClick={() => setShowSpace(!showSpace)}
            >
              {showSpace ? "Close" : "Open"} Portal
              <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
            </button>
          </div>

          <div className="border-r border-gray-300 mx-16"></div>

          <div>
            <p className="font-semibold mb-2">Sync Records to HCM.show</p>
            <p className="text-gray-600 mb-6 max-w-lg">
              After uploading records in Flatfile, click the button below to
              sync the records into HCM.show.
            </p>
            <button
              type="submit"
              className=" bg-slate-400 hover:cursor-not-allowed inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto"
            >
              Sync Records
              <ArrowPathIcon className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
      {error && <div>{error}</div>}
      {!error && showSpace && (
        <div>
          <div className="mb-16">
            <div className="text-3xl mb-6">Let's import your data.</div>
            <div className="font-semibold text-xl mb-2">1. Visit Files</div>
            <p className="mb-6">
              Click "Files" in the left-hand sidebar. This is where you can
              upload files you want to import into Flatfile.
            </p>
            <div className="font-semibold text-xl mb-2">
              2. Upload the sample data
            </div>
            <p className="mb-2">
              On the Files page, click "Add files" or drag-and-drop the sample
              data you downloaded previously onto the page.
            </p>
            <p>
              After the file uploads, click "Import" and follow the steps to
              completion to import the workbook.
            </p>
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

  return {
    props: { accessToken, environmentToken },
  };
};

export default Embedded;
