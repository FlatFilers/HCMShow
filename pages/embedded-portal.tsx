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
import Workspace from "../components/embedded-portal/workspace";

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

  useEffect(() => {
    if (!existingSpace && localStorage.getItem(storageKey) === "true") {
      setSteps([
        { ...steps[0], status: "complete" },
        { ...steps[1], status: "current" },
      ]);
    }
  }, []);

  return (
    <div className="mx-12 max-w-5xl mt-16 self-center">
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

      <div className="flex flex-col justify-between">
        {downloaded && existingSpace && (
          <Workspace
            fileName={sampleDataFileName}
            onClick={() => {
              // When the space is opened, save the time we started listening for events
              if (showSpace === false) {
                setCurrentTime(DateTime.now().toUTC());
              }

              setShowSpace(!showSpace);
            }}
            showSpace={showSpace}
          />
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
      userId: token.sub,
    },
  };
};

export default EmbeddedPortal;