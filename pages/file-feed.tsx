import { Action, PrismaClient, Space } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { FormEvent, useState } from "react";
import { getToken } from "next-auth/jwt";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { SetupSpace } from "../components/filefeed/setup-space";
import { Events } from "../components/filefeed/events";
import { SpaceType } from "../lib/space";
import {
  ActionType,
  FileFeedEvent,
  FileFeedEventType,
  fileFeedEventFromAction,
  getActions,
} from "../lib/action";
import { FlatfileSpaceData } from "../lib/flatfile";
import { DateTime } from "luxon";

interface Props {
  urlToSpace: string;
  events: FileFeedEvent[];
}

const FileFeed: NextPage<Props> = ({ urlToSpace, events }) => {
  const router = useRouter();

  useEffect(() => {
    if (router.query.flash === "success") {
      window.history.replaceState(null, "", "/file-feed");
      toast.success(router.query.message as string, {
        id: router.query.message as string,
        duration: 4000,
      });
    } else if (router.query.flash === "error") {
      window.history.replaceState(null, "", "/file-feed");
      toast.error(router.query.message as string, { id: "error" });
    } else if (router.query.message === "Created space") {
      window.history.replaceState(null, "", "/file-feed");
      toast.success("Created space", { id: "created" });
    }
  }, []);

  // TODO: remove the hardcoded stuff here and use the actual events

  return (
    <div className="ml-12 mt-16">
      {!urlToSpace && <SetupSpace />}

      {urlToSpace && <Events urlToSpace={urlToSpace} initialEvents={events} />}
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
        type: SpaceType.FileFeed,
      },
    },
  });

  if (!space) {
    return {
      props: {},
    };
  }

  const actions = await getActions(token.organizationId);
  const events = actions.map((a) => fileFeedEventFromAction(a));

  const urlToSpace = (space.flatfileData as unknown as FlatfileSpaceData)
    .guestLink;

  return {
    props: { urlToSpace, events },
  };
};

export default FileFeed;
