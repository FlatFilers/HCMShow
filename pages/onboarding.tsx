import { Action, PrismaClient, Space } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { FormEvent, useState } from "react";
import { getToken } from "next-auth/jwt";
import { FlatfileSpaceData } from "../lib/flatfile";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useRouter } from "next/router";

interface Props {
  space?: Space;
  lastSyncAction?: Action;
}

const sampleDataFileName = "/sample-data/sample-hcm-employees.csv";

const Onboarding: NextPage<Props> = ({ space, lastSyncAction }) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  let defaultText = space ? "Sync Records" : "Create Space";
  const [buttonText, setButtonText] = useState<string>(defaultText);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    space
      ? setButtonText("Syncing records...")
      : setButtonText("Creating space...");
  };

  const router = useRouter();

  useEffect(() => {
    if (router.query.flash === "success") {
      window.history.replaceState(null, "", "/onboarding");
      toast.success(router.query.message as string, {
        id: router.query.message as string,
        duration: 4000,
        style: {
          minWidth: "450px",
        },
      });
    } else if (router.query.flash === "error") {
      window.history.replaceState(null, "", "/onboarding");
      toast.error(router.query.message as string, { id: "error" });
    } else if (router.query.message === "Created space") {
      window.history.replaceState(null, "", "/onboarding");
      toast.success("Created space", { id: "created" });
    }
  }, []);

  return (
    <div className="text-gray-800">
      {!space && (
        <div>
          <p className="text-2xl mb-8">Onboarding Setup</p>

          <p className="text-xl">1. Download Sample Data</p>
          <p className="mb-4">
            Click the button below to download the sample dataset.
          </p>

          <a
            className="hover:text-white mb-12 inline-flex items-center justify-center rounded-md border text-primary border-primary px-4 py-2 text-sm font-medium shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            download={sampleDataFileName}
            href={sampleDataFileName}
          >
            Download sample data
          </a>

          <p className="text-xl">2. Create Space</p>
          <p className="mb-4">
            Next, click the button below to create your Space in Flatfile.
          </p>

          <form action="/api/flatfile/create-space" onSubmit={handleSubmit}>
            <button
              onClick={() => toast.loading("Creating Space...")}
              disabled={isSubmitting}
              className={`${
                isSubmitting
                  ? "bg-indigo-400 hover:cursor-not-allowed"
                  : "bg-primary hover:bg-primary-dark"
              } inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto}`}
              type="submit"
            >
              {buttonText}
            </button>
          </form>
        </div>
      )}

      {space && (
        <div>
          <div className="mb-12">
            <p className="text-2xl mb-8">Onboarding</p>

            <p className="text-xl">1. Visit Space</p>
            <p className="mb-4">
              Click the button below to visit your space and upload records into
              Flatfile.
            </p>

            <a
              target="_blank"
              href={
                (space.flatfileData as unknown as FlatfileSpaceData).guestLink
              }
              className="mb-2 inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Visit Space
            </a>

            <p className="text-xs block text-gray-600">
              To download the sample data again{" "}
              <a
                className="underline text-primary hover:text-primary-dark"
                download={sampleDataFileName}
                href={sampleDataFileName}
              >
                click here.
              </a>
            </p>
          </div>

          <div>
            <p className="text-xl">2. Sync Records</p>
            <p className="mb-4">
              After uploading records in Flatfile, click the button below to
              sync those records with HCM.show.
            </p>

            <form
              action="/api/flatfile/sync-records"
              method="post"
              onSubmit={handleSubmit}
            >
              <button
                onClick={() => toast.loading("Syncing...")}
                disabled={isSubmitting}
                type="submit"
                className={`${
                  isSubmitting
                    ? "bg-indigo-400 hover:cursor-not-allowed"
                    : "bg-primary hover:bg-primary-dark"
                } inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto}`}
              >
                {buttonText}
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
  const space = await prisma.space.findFirst({
    where: {
      userId: token.sub,
    },
    orderBy: {
      createdAt: "desc",
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

  return {
    props: { space, lastSyncAction },
  };
};

export default Onboarding;
