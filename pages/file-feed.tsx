import { PrismaClient } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { getToken } from "next-auth/jwt";
import { useRouter } from "next/router";
import { SetupSpace } from "../components/filefeed/setup-space";
import { Events } from "../components/filefeed/events";
import { SpaceType } from "../lib/space";
import { ActionType, FileFeedEvent, getActions } from "../lib/action";
import { DateTime } from "luxon";
import { workflowItems } from "../components/sidebar-layout";
import { useFlashMessages } from "../lib/hooks/usehooks";
import { FlatfileSpaceData } from "../lib/flatfile";
import StepList from "../components/shared/step-list";
import SVG from "react-inlinesvg";

interface Step {
  name: string;
  status: "current" | "upcoming" | "complete";
}

const steps: Step[] = [
  {
    name: "Setup Flatfile",
    status: "current",
  },
  {
    name: "Listen for File Uploads",
    status: "upcoming",
  },
];

interface Props {
  flatfileSpaceId?: string;
  events: FileFeedEvent[];
}

const FileFeed: NextPage<Props> = ({ flatfileSpaceId, events }) => {
  const router = useRouter();

  const item = workflowItems(router).find((i) => i.slug === "file-feed")!;

  useFlashMessages(router.query, item.href);

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

      <div>
        {!flatfileSpaceId && <SetupSpace />}

        {flatfileSpaceId && (
          <Events flatfileSpaceId={flatfileSpaceId} initialEvents={events} />
        )}
      </div>

      <SVG
        src={item.heroUri}
        className="w-full md:w-2/3 lg:w-1/2 md:mx-auto md:absolute md:left-[35%] md:top-[100%] lg:left-[40%] lg:top-[60%]"
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

  const actions = await getActions(token.organizationId, [
    ActionType.FileFeedEvent,
    ActionType.SyncFilefeedRecords,
  ]);

  const events = actions.map((a) => {
    const metadata = a.metadata as {
      topic: string;
    };

    return {
      topic: metadata.topic,
      when: DateTime.fromJSDate(a.createdAt).toFormat("MM/dd/yyyy hh:mm:ssa"),
    };
  });

  const flatfileSpaceId = space.flatfileSpaceId;

  return {
    props: { flatfileSpaceId, events },
  };
};

export default FileFeed;
