import { Action, PrismaClient, Space } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { FormEvent, useRef, useState } from "react";
import { getToken } from "next-auth/jwt";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { SetupSpace } from "../components/filefeed/setup-space";
import { Events } from "../components/filefeed/events";

interface Props {
  space?: Space;
  actions: Action[];
}

const sampleDataFileName = "/sample-hcm-employees.csv";

const FileFeed: NextPage<Props> = ({ space, actions }) => {
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

  useEffect(() => {
    if (router.query.flash === "success") {
      window.history.replaceState(null, "", "/file-feed");
      toast.success(router.query.message as string, {
        id: router.query.message as string,
        duration: 4000,
        style: {
          minWidth: "450px",
        },
      });
    } else if (router.query.flash === "error") {
      window.history.replaceState(null, "", "/file-feed");
      toast.error(router.query.message as string, { id: "error" });
    } else if (router.query.message === "Created space") {
      window.history.replaceState(null, "", "/file-feed");
      toast.success("Created space", { id: "created" });
    }
  }, []);

  return (
    <div className="ml-12 flex flex-row justify-between max-w-5xl mt-16">
      {!space && <SetupSpace />}

      {space && <Events actions={actions} />}
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

  const actions = await prisma.action.findMany({
    where: {
      organizationId: token.organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    props: { space, actions },
  };
};

export default FileFeed;
