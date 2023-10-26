import { NextPageWithLayout } from "./_app";
import { useState, useEffect } from "react";
import { type ISpace } from "@flatfile/react";
import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import { SpaceType } from "../lib/space";
import { useRouter } from "next/router";
import { workflowItems } from "../components/sidebar-layout";
import DownloadFile from "../components/shared/download-file";
import SetupSpace from "../components/shared/setup-space";
import StepList, { Step } from "../components/shared/step-list";
import Workspace from "../components/embedded-portal/workspace";
import { useFlashMessages } from "../lib/hooks/usehooks";
import { FlatfileSpaceData, WorkflowType, getSpace } from "../lib/flatfile";

import SVG from "react-inlinesvg";
import dynamic from "next/dynamic";
import { ReusedSpaceWithAccessToken } from "@flatfile/react/dist/src/types/ISpace";
import { prismaClient } from "../lib/prisma-client";
import StepListNew from "../components/shared/step-list-new";
import DownloadFileNew from "../components/shared/download-file-new";
import SetupSpaceNew from "../components/shared/setup-space-new";

const DynamicEmbeddedSpace = dynamic(
  () => import("../components/shared/embedded-space"),
  {
    loading: () => <div></div>,
    ssr: false,
  }
);

const STORAGE_KEY = "embedded-has-downloaded-sample-data";
const SAMPLE_DATA_FILENAME = "/benefits-sample-data.csv";

interface ExistingSpaceProps {
  environmentId: string;
  space: ReusedSpaceWithAccessToken["space"];
}
interface NoExistingSpaceProps {
  environmentId: never;
  space: never;
}
type Props = ExistingSpaceProps | NoExistingSpaceProps;

const EmbeddedPortal: NextPageWithLayout<Props> = ({
  space,
  environmentId,
}: Props) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>("Setup Flatfile");
  const handleSubmit = () => {
    setIsSubmitting(true);
    setButtonText("Setting up Flatfile...");
  };

  const [showSpace, setShowSpace] = useState(false);
  const error = (error: Error | string) => {
    return (
      <div>
        <XCircleIcon
          className="h-7 w-7 absolute top-[-32px] right-[-20px] hover:cursor-pointer text-white"
          onClick={() => setShowSpace(false)}
        >
          Close
        </XCircleIcon>
        <div className="text-black bg-white text-lg font-semibold p-8">
          Error: An error occurred opening the portal
        </div>
      </div>
    );
  };

  const spaceProps: ISpace = {
    error,
    space,
    environmentId,
    closeSpace: {
      operation: "contacts:submit", // todo: what do we put here?
      onClose: () => setShowSpace(false),
    },
  };

  const [downloaded, setDownloaded] = useState(false);
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      setDownloaded(true);
    }
  }, []);

  const router = useRouter();
  const embeddedItem = workflowItems(router).find(
    (i) => i.slug === "embedded-portal"
  )!;
  useFlashMessages(router.query, embeddedItem.href);

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

          if (res.actions && res.actions.length > 0) {
            res.actions.forEach((a) => {
              toast.success(a.description, {
                id: DateTime.now().toISO()!,
                duration: 4000,
              });
            });

            router.replace("/employee-benefit-plans");
          }
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

  const item = workflowItems(router).find((i) => i.slug === "embedded-portal")!;

  useEffect(() => {
    if (!space && localStorage.getItem(STORAGE_KEY) === "true") {
      setSteps([
        { ...steps[0], status: "complete" },
        { ...steps[1], status: "current" },
      ]);
    }
  }, []);

  return (
    <div className="text-white space-y-8 md:relative">
      {!space && <StepListNew steps={steps} />}

      <div className="space-y-4">
        <SVG src={item.imageUri} className={`icon-${item.slug} w-16 h-16`} />
        <h1
          className={`text-4xl font-bold border-b border-${item.slug} pb-4 inline-block`}
        >
          {item.name}
        </h1>
        <p className="md:max-w-lg">{item.description}</p>
      </div>

      {!space && (
        <div className="flex flex-row justify-between">
          {steps[0].status === "current" && (
            <DownloadFileNew
              fileName={SAMPLE_DATA_FILENAME}
              onClick={() => {
                localStorage.setItem(STORAGE_KEY, "true");

                // set steps but change the status of the current step
                setSteps([
                  { ...steps[0], status: "complete" },
                  { ...steps[1], status: "current" },
                ]);
              }}
            />
          )}

          {steps[1].status === "current" && (
            <SetupSpaceNew
              fileName={SAMPLE_DATA_FILENAME}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              buttonText={buttonText}
              actionHref="/api/flatfile/create-embed-space"
            />
          )}
        </div>
      )}

      <div className="flex flex-col justify-between">
        {downloaded && space && (
          <>
            <Workspace
              fileName={SAMPLE_DATA_FILENAME}
              onClick={() => {
                // When the space is opened, save the time we started listening for events
                if (showSpace === false) {
                  setCurrentTime(DateTime.now().toUTC());
                }

                setShowSpace(!showSpace);
              }}
              showSpace={showSpace}
            />

            {showSpace && <DynamicEmbeddedSpace spaceProps={spaceProps} />}
          </>
        )}
      </div>

      <SVG
        src={item.heroUri}
        className="w-full md:w-2/3 lg:w-1/2 md:mx-auto md:absolute md:left-[35%] md:top-[100%] lg:left-[30%] lg:top-[100%]"
      />
    </div>
  );

  return (
    <div className="mx-12 mt-16 self-center text-white">
      <div className="max-w-5xl">
        <div className="mb-12">
          <div
            className={`border-t-[6px] w-12 mb-2 ${embeddedItem.color}`}
          ></div>
          <p className="text-sm font-semibold">{embeddedItem.name}</p>
        </div>

        {!space && (
          <div className="flex flex-row justify-between">
            {steps[0].status === "current" && (
              <DownloadFile
                fileName={SAMPLE_DATA_FILENAME}
                onClick={() => {
                  localStorage.setItem(STORAGE_KEY, "true");

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
                fileName={SAMPLE_DATA_FILENAME}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                buttonText={buttonText}
                actionHref="/api/flatfile/create-embed-space"
              />
            )}

            <StepList steps={steps} />
          </div>
        )}

        <div className="flex flex-col justify-between">
          {downloaded && space && (
            <>
              <Workspace
                fileName={SAMPLE_DATA_FILENAME}
                onClick={() => {
                  // When the space is opened, save the time we started listening for events
                  if (showSpace === false) {
                    setCurrentTime(DateTime.now().toUTC());
                  }

                  setShowSpace(!showSpace);
                }}
                showSpace={showSpace}
              />

              {showSpace && <DynamicEmbeddedSpace spaceProps={spaceProps} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = await getToken({
    req: context.req,
  });

  if (!token) {
    return {
      notFound: true,
    };
  }

  const existingSpace = await prismaClient.space.findUnique({
    where: {
      userId_type: {
        userId: token.sub as string,
        type: SpaceType.Embed,
      },
    },
  });

  if (!existingSpace) {
    return {
      props: {},
    };
  }

  const existingSpaceId = existingSpace.flatfileSpaceId;

  const environmentId = process.env.EMBEDDED_ENVIRONMENT_ID;

  if (!environmentId) {
    throw new Error("Missing EMBEDDED_ENVIRONMENT_ID env var");
  }

  let spaceData = await getSpace({
    workflow: WorkflowType.Embedded,
    spaceId: existingSpaceId,
  });

  if (!spaceData || !spaceData?.id || !spaceData?.accessToken) {
    throw new Error(`Unable to get space data for space ${existingSpaceId}`);
  }

  const props: Props = {
    environmentId,
    space: {
      id: spaceData?.id,
      accessToken: spaceData?.accessToken,
    },
  };

  return {
    props,
  };
};

export default EmbeddedPortal;
