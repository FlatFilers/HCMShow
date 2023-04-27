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
import { SpaceType } from "../lib/space";
import { workflowItems } from "../components/sidebar-layout";
import StepList, { Step } from "../components/shared/step-list";
import DownloadFile from "../components/project-onboarding/download-file";
import SetupSpace from "../components/project-onboarding/setup-space";
import Workspace from "../components/project-onboarding/workspace";

interface Props {
  space?: Space;
  lastSyncedAt?: string;
}

const sampleDataFileName = "/hcm-show-project-onboarding-data.xlsx";

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

  const projectOnboardingItem = workflowItems(router).find(
    (i) => i.slug === "project-onboarding"
  )!;

  useEffect(() => {
    if (router.query.flash === "success") {
      window.history.replaceState(null, "", projectOnboardingItem.href);
      toast.success(router.query.message as string, {
        id: router.query.message as string,
        duration: 4000,
        style: {
          minWidth: "450px",
        },
      });
    } else if (router.query.flash === "error") {
      window.history.replaceState(null, "", projectOnboardingItem.href);
      toast.error(router.query.message as string, { id: "error" });
    }
  }, []);

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

  const storageKey = "project-onboarding-has-downloaded-sample-data";

  useEffect(() => {
    if (!space && localStorage.getItem(storageKey) === "true") {
      setSteps([
        { ...steps[0], status: "complete" },
        { ...steps[1], status: "current" },
      ]);
    }
  }, []);

  return (
    <div className="ml-12 max-w-5xl mt-16">
      <div className="mb-12">
        <div
          className={`border-t-[6px] w-12 mb-2 ${projectOnboardingItem.color}`}
        ></div>
        <p className="text-sm font-semibold">{projectOnboardingItem.name}</p>
      </div>

      {!space && (
        <div className="flex flex-row justify-between">
          {steps[0].status === "current" && (
            <DownloadFile
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
            />
          )}

          <StepList steps={steps} />
        </div>
      )}

      {space && (
        <Workspace
          space={space}
          fileName={sampleDataFileName}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          buttonText={buttonText}
        />
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
