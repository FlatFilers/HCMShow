import { GetServerSideProps } from "next";
import { FormEvent, useState } from "react";
import { getToken } from "next-auth/jwt";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "./_app";
import { SpaceType } from "../lib/space";
import { workflowItems } from "../components/sidebar-layout";
import StepList, { Step } from "../components/shared/step-list";
import DownloadFile from "../components/shared/download-file";
import SetupSpace from "../components/shared/setup-space";
import Workspace from "../components/project-onboarding/workspace";
import { useFlashMessages } from "../lib/hooks/usehooks";
import { prismaClient } from "../lib/prisma-client";
import { WorkflowType, getSpace } from "../lib/flatfile";
import { FlatfileSpaceData } from "../lib/flatfile-legacy";

interface Props {
  flatfileSpaceId?: string;
}

const sampleDataFileName = "/jobs_employees.xlsx";

const Onboarding: NextPageWithLayout<Props> = ({ flatfileSpaceId }) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  let defaultText = flatfileSpaceId ? "Sync Records" : "Setup Flatfile";
  const [buttonText, setButtonText] = useState<string>(defaultText);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    flatfileSpaceId
      ? setButtonText("Syncing records...")
      : setButtonText("Setting up Flatfile...");
  };

  const router = useRouter();

  const projectOnboardingItem = workflowItems(router).find(
    (i) => i.slug === "project-onboarding"
  )!;

  useFlashMessages(router.query, projectOnboardingItem.href);

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
    if (!flatfileSpaceId && localStorage.getItem(storageKey) === "true") {
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

      {!flatfileSpaceId && (
        <div className="flex flex-row justify-between">
          {steps[0].status === "current" && (
            <DownloadFile
              type="project-onboarding"
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
              actionHref="/api/flatfile/create-onboarding-space"
              type="project-onboarding"
            />
          )}

          <StepList type="project-onboarding" steps={steps} />
        </div>
      )}

      {flatfileSpaceId && (
        <Workspace
          flatfileSpaceId={flatfileSpaceId}
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

  const dbSpace = await prismaClient.space.findUnique({
    where: {
      userId_type: {
        userId: token.sub as string,
        type: SpaceType.WorkbookUpload,
      },
    },
  });

  if (!dbSpace) {
    return {
      props: {},
    };
  }

  return {
    props: {
      flatfileSpaceId: (dbSpace.flatfileData as unknown as FlatfileSpaceData)
        .id,
    },
  };
};

export default Onboarding;
