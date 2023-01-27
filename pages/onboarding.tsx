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

const Onboarding: NextPage<Props> = ({ space, lastSyncAction }) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>("Create Space");
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    setButtonText("Creating space...");
  };

  const router = useRouter();

  useEffect(() => {
    if (router.query.message === "Created space") {
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
            className="hover:text-white mb-12 inline-flex items-center justify-center rounded-md border text-indigo-600 border-indigo-600 px-4 py-2 text-sm font-medium shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            download={"sample-employees.csv"}
            href={"/sample-data/sample-employees.csv"}
          >
            Download sample data
          </a>

          <p className="text-xl">2. Create Space</p>
          <p className="mb-4">
            Next, click the button below to create your Space in Flatfile.
          </p>

          <form action="/api/flatfile/create-space" onSubmit={handleSubmit}>
            <button
              className={`${
                isSubmitting
                  ? "bg-indigo-400"
                  : "bg-indigo-600 hover:bg-indigo-700 "
              } inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto}`}
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
              className="mb-2 inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Visit Space
            </a>

            <p className="text-xs block text-gray-600">
              To download the sample data again{" "}
              <a
                className="underline text-indigo-600"
                download={"sample-employees.csv"}
                href={"/sample-data/sample-employees.csv"}
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

            <form action="/api/flatfile/sync-records" method="post">
              <button
                onClick={() => toast.loading("Syncing...")}
                type="submit"
                className="hover:text-white mb-2 inline-flex items-center justify-center rounded-md border text-indigo-600 border-indigo-600 px-4 py-2 text-sm font-medium shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                Sync Records
              </button>
            </form>

            {lastSyncAction && (
              <p className="text-xs block text-gray-600 italic">
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
