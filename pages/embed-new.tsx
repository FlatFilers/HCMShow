import { NextPageWithLayout } from "./_app";
import { useState } from "react";
import { useSpace } from "@flatfile/react";
import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import { PrismaClient, Space } from "@prisma/client";
import { DateTime } from "luxon";
import { SpaceType } from "../lib/space";
import { FlatfileSpaceData } from "../lib/flatfile";
import { Flatfile } from "@flatfile/api";
import { getSpace, getWorkbook } from "../lib/new-flatfile";
import { Workbook } from "@flatfile/api/api";

interface Props {
  accessToken: string;
  environmentToken: string;
  existingSpace: Space;
  workbookConfig?: Flatfile.CreateWorkbookConfig;
  userId: string;
}

const EmbeddedPortal: NextPageWithLayout<Props> = ({
  environmentToken,
  existingSpace,
  workbookConfig,
  userId,
}) => {
  const publishableKey = process.env
    .NEXT_PUBLIC_EMBEDDED_PUBLISHABLE_KEY as string;

  const flatfleSpace =
    existingSpace?.flatfileData as unknown as FlatfileSpaceData;
  const [showSpace, setShowSpace] = useState(false);

  console.log("workbookConfig", workbookConfig);

  const spaceProps = {
    name: "Embedded Portal",
    publishableKey,
    environmentId: environmentToken as string,
    workbook: {
      name: "Employees workbook",
      sheets: [
        {
          name: "Contacts",
          slug: "Contacts",
          fields: [
            {
              key: "first_name",
              type: "string",
              label: "First name",
              constraints: [
                {
                  type: "required",
                },
              ],
            },
            {
              key: "last_name",
              type: "string",
              label: "last name",
              constraints: [
                {
                  type: "unique",
                },
              ],
            },
            {
              key: "full_name",
              type: "string",
              label: "full name",
            },
          ],
        },
      ],
      actions: [
        {
          label: "Submit",
          operation: "contacts:submit",
          description: "Would you like to submit your workbook?",
          mode: "foreground",
          primary: true,
          confirm: true,
        },
      ],
    } as Flatfile.CreateWorkbookConfig,
    closeSpace: {
      operation: "contacts:submit",
      onClose: () => setShowSpace(false),
    },
  };

  const { component } = useSpace(spaceProps);

  return (
    <div className="mx-12 mt-16 self-center">
      <button onClick={() => setShowSpace(!showSpace)}>Toggle Portal</button>

      {showSpace && <div>{component}</div>}
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

  const environmentToken = process.env.EMBEDDED_ENVIRONMENT_ID;

  if (!existingSpace) {
    console.log("No space");
    return {
      props: {
        environmentToken,
        existingSpace,
        userId: token.sub,
      },
    };
  }

  const spaceData = await getSpace(
    (existingSpace?.flatfileData as unknown as FlatfileSpaceData).id
  );

  console.log("spaceData", spaceData);

  const workbook = await getWorkbook(spaceData?.primaryWorkbookId as string);

  console.log("workbook", JSON.stringify(workbook, null, 2));

  const workbookConfig = {
    name: workbook?.name || "HCM.show Embedded Portal",
    sheets: workbook?.sheets?.map((s) => {
      return {
        name: s.name,
        slug: s.config?.slug,
        fields: s.config?.fields,
      };
    }),
    actions: workbook?.actions,
  };

  console.log("workbookConfig", JSON.stringify(workbookConfig, null, 2));

  return {
    props: {
      environmentToken,
      existingSpace,
      workbookConfig,
    },
  };
};

export default EmbeddedPortal;
