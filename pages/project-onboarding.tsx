import { GetServerSideProps } from "next";
import { FormEvent, useState } from "react";
import { getToken } from "next-auth/jwt";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "./_app";
import { SpaceType } from "../lib/space";
import { workflowItems } from "../components/sidebar-layout";
import StepList, { Step } from "../components/shared/step-list";
import SetupSpace from "../components/shared/setup-space";
import Workspace from "../components/project-onboarding/workspace";
import { useFlashMessages } from "../lib/hooks/usehooks";
import { prismaClient } from "../lib/prisma-client";
import SVG from "react-inlinesvg";
import DownloadFile from "../components/shared/download-file";

interface Props {
  flatfileSpaceId?: string;
}

const sampleDataFileName = "/jobs_employees.xlsx";

const Onboarding: NextPageWithLayout<Props> = ({ flatfileSpaceId }) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>("Setup Flatfile");
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    setButtonText("Setting up Flatfile...");
  };

  const router = useRouter();

  const item = workflowItems(router).find(
    (i) => i.slug === "project-onboarding"
  )!;

  useFlashMessages(router.query, item.href);

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
    <div className="text-white space-y-8 md:relative">
      {!flatfileSpaceId && <StepList steps={steps} />}

      <div className="space-y-4">
        <SVG src={item.imageUri} className={`icon-${item.slug} w-16 h-16`} />
        <h1
          className={`text-4xl font-bold border-b border-${item.slug} pb-4 inline-block`}
        >
          {item.name}
        </h1>
        <p className="md:max-w-lg">{item.description}</p>
      </div>

      {!flatfileSpaceId && (
        <div>
          {steps[0].status === "current" && (
            <DownloadFile
              fileName={sampleDataFileName}
              onClick={() => {
                localStorage.setItem(storageKey, "true");

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
            />
          )}
        </div>
      )}

      {flatfileSpaceId && (
        <Workspace
          flatfileSpaceId={flatfileSpaceId}
          fileName={sampleDataFileName}
        />
      )}

      <SVG
        src={item.heroUri}
        className="w-full md:w-2/3 lg:w-1/2 md:mx-auto md:absolute md:left-[45%] md:top-[100%] lg:left-[30%] lg:top-[85%]"
      />
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
      flatfileSpaceId: dbSpace.flatfileSpaceId,
    },
  };
};

export default Onboarding;
