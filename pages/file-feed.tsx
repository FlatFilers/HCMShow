import { PrismaClient } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { getToken } from "next-auth/jwt";
import { useRouter } from "next/router";
import { SetupSpace } from "../components/filefeed/setup-space";
import { Events } from "../components/filefeed/events";
import { SpaceType } from "../lib/space";
import { ActionType, FileFeedEvent, getActions } from "../lib/action";
import { FlatfileSpaceData } from "../lib/flatfile-legacy";
import { DateTime } from "luxon";
import { workflowItems } from "../components/sidebar-layout";
import { useFlashMessages } from "../lib/hooks/usehooks";

interface Props {
  flatfileSpaceId?: string;
  events: FileFeedEvent[];
}

const FileFeed: NextPage<Props> = ({ flatfileSpaceId, events }) => {
  const router = useRouter();

  const fileFeedItem = workflowItems(router).find(
    (i) => i.slug === "file-feed"
  )!;

  useFlashMessages(router.query, fileFeedItem.href);

  // TODO: remove the hardcoded stuff here and use the actual events

  return (
    <div className="ml-12 max-w-5xl mt-16">
      <div className="mb-12">
        <div className={`border-t-[6px] w-12 mb-2 ${fileFeedItem.color}`}></div>
        <p className="text-sm font-semibold">{fileFeedItem.name}</p>
      </div>

      <div>
        {!flatfileSpaceId && <SetupSpace />}

        {flatfileSpaceId && (
          <Events flatfileSpaceId={flatfileSpaceId} initialEvents={events} />
        )}
      </div>
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

  // console.log("space", space);

  const eventActions = await getActions(
    token.organizationId,
    ActionType.FileFeedEvent
  );

  const syncActions = await getActions(
    token.organizationId,
    ActionType.SyncFilefeedRecords
  );

  const actions = [...eventActions, ...syncActions].sort((a, b) => {
    return a.createdAt > b.createdAt ? -1 : 1;
  });

  const events = actions.map((a) => {
    const metadata = a.metadata as {
      topic: string;
    };

    return {
      topic: metadata.topic || null,
      when: DateTime.fromJSDate(a.createdAt).toFormat("MM/dd/yyyy hh:mm:ssa"),
    };
  });

  const flatfileSpaceId = (space.flatfileData as unknown as FlatfileSpaceData)
    .id;

  return {
    props: { flatfileSpaceId, events },
  };
};

export default FileFeed;
