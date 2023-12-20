import { NextPageWithLayout } from "./_app";
import { FormEvent, useState, useRef } from "react";
import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { CustomFieldBuilder } from "../components/dynamic-templates/custom-field-builder";
import toast from "react-hot-toast";
import { workflowItems } from "../components/sidebar-layout";
import { DateTime } from "luxon";
import { useOnClickOutside } from "../lib/hooks/usehooks";
import { SpaceRepo, SpaceType } from "../lib/space";
import {
  WorkflowType,
  createSpace,
  getSpace,
  getWorkbook,
} from "../lib/flatfile";
import { Flatfile } from "@flatfile/api";
import { type ISpace } from "@flatfile/react";
import { prismaClient } from "../lib/prisma-client";
import { theme } from "../lib/theme";
import { document } from "../components/dynamic-templates/document";
import SVG from "react-inlinesvg";

import dynamic from "next/dynamic";
import {
  CustomField,
  DEFAULT_CUSTOM_FIELD,
  Option,
} from "../lib/dynamic-portal-options";

const DynamicEmbeddedSpace = dynamic(
  () => import("../components/shared/embedded-space"),
  {
    loading: () => <div></div>,
    ssr: false,
  }
);

const customOptionsConfig = (options: Option[]) => {
  const mappedOptions = options.map((o) => {
    return {
      value: o.input,
      label: o.output,
    };
  });

  return {
    config: { options: mappedOptions },
  };
};

const generateConfig = ({
  workbookConfig,
  customFieldConfig,
}: {
  workbookConfig: Flatfile.CreateWorkbookConfig;
  customFieldConfig: any;
}) => {
  const { name, sheets, actions } = workbookConfig;

  if (!sheets) {
    console.log("The workbook has no sheets. Unable to filter config.");
    return workbookConfig;
  }

  const { name: sheetName, slug } = sheets[0];

  const filteredConfig = {
    name,
    sheets: [
      {
        name: sheetName,
        slug,
        fields: [...sheets[0].fields, ...[customFieldConfig]],
      },
    ],
    actions,
  };
  // console.log("filteredConfig", filteredConfig);

  return filteredConfig;
};

interface Props {
  environmentToken: string;
  workbookConfig: Flatfile.CreateWorkbookConfig;
  userId: string;
  dbCustomField: CustomField | null;
}

const DynamicTemplates: NextPageWithLayout<Props> = ({
  environmentToken,
  workbookConfig,
  userId,
  dbCustomField,
}) => {
  const [showSpace, setShowSpace] = useState(false);
  const [customField, setCustomField] = useState<CustomField>(
    dbCustomField ?? DEFAULT_CUSTOM_FIELD
  );

  const customFieldConfig = {
    key: customField.name?.replace(/\s/, ""),
    type: customField.type,
    label: customField.name,
    description: "Custom field",
    constraints: [{ type: "required" }],
    ...(customField.type === "enum" &&
      customField.enumOptions &&
      customOptionsConfig(customField.enumOptions)),
  };

  const publishableKey = process.env.NEXT_PUBLIC_DYNAMIC_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw "Missing NEXT_PUBLIC_DYNAMIC_PUBLISHABLE_KEY env var";
  }

  const error = (error: string) => {
    console.log("error", error);
    return (
      <div>
        <XCircleIcon
          className="h-7 w-7 absolute top-[-32px] right-[-20px] hover:cursor-pointer text-white"
          onClick={() => setShowSpace(false)}
        >
          Close
        </XCircleIcon>
        <div className="text-black bg-white text-lg font-semibold p-8">
          Error: An error occurred opening the portal
        </div>
      </div>
    );
  };

  // TODO: Adjust space properties here
  const spaceProps = {
    error,
    publishableKey,
    environmentId: environmentToken,
    name: "Dynamic Portal",
    themeConfig: theme("#71a3d2", "#3A7CB9"),
    document: document,
    workbook: generateConfig({
      workbookConfig,
      customFieldConfig,
    }),
    spaceInfo: {
      userId,
    },
    sidebarConfig: {
      showDataChecklist: false,
      showSidebar: true,
    },
    closeSpace: {
      operation: "contacts:submit", // todo: what do we put here?
      onClose: () => setShowSpace(false),
    },
  } as ISpace;

  const item = workflowItems().find((i) => i.slug === "dynamic-portal")!;

  const handleResetSubmit = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      if (confirm("Reset workspace options?")) {
        const response = await fetch("/api/v1/reset-workspace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          toast.error("Error resetting workspace");
          throw new Error("Error resetting workspace");
        }

        setCustomField(DEFAULT_CUSTOM_FIELD);

        toast.success("Workspace Reset");
      }
    } catch (error) {
      console.error("Error Resetting Workspace:", error);
    }
  };

  const modalRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(modalRef, () => setShowSpace(false));

  return (
    <div className="text-white space-y-8 md:relative lg:max-w-3xl">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
        <div className="space-y-4">
          <SVG src={item.imageUri} className={`icon-${item.slug} w-16 h-16`} />
          <h1
            className={`text-4xl font-bold border-b border-${item.slug} pb-4 inline-block`}
          >
            {item.name}
          </h1>
        </div>

        <div className="card-bg card-sm space-y-2 md:max-w-sm">
          <SVG src="/images/lightbulb.svg" />
          <p className="text-sm font-bold">Customize your workspace</p>
          <p className="text-xs font-light">
            Adjust the field options below. Save each as you complete them and
            then click Open Portal to add your data.
          </p>
        </div>
      </div>

      <div className="space-y-2 md:max-w-md">
        <p className="text-sm font-semibold">Create Custom Fields</p>
        <p className="text-sm font-light leading-5">{item.description}</p>
      </div>

      <div className="">
        <div className="grid grid-cols-3 text-xs border-b border-gray-500 pb-4 space-x-2">
          <div>Field Name</div>
          <div>Field Type</div>
          <div>Required?</div>
        </div>

        <div className="space-y-2 py-4">
          {workbookConfig.sheets &&
            workbookConfig.sheets[0].fields.map((f) => {
              return (
                <div
                  key={f.key}
                  className="grid grid-cols-3 card-bg card-sm space-x-2 text-sm items-center"
                  style={{
                    boxShadow:
                      "8.74046516418457px 9.711627960205078px 18.45209312438965px 0px rgba(61, 73, 100, 0.3) inset",
                  }}
                >
                  <div>{f.label}</div>
                  <div className="capitalize">{f.type}</div>
                  <div className="flex flex-row items-center">
                    <input
                      type="checkbox"
                      checked={
                        f.constraints?.find((c) => c.type === "required") !==
                        undefined
                      }
                      disabled
                      className="text-dynamic-portal"
                    />
                  </div>
                </div>
              );
            })}

          <CustomFieldBuilder
            customField={customField}
            setCustomField={setCustomField}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <p className="font-semibold">Generate your workspace</p>
          <p className="text-gray-400 text-sm">
            Click to generate the workspace with your custom config and input
            your data.
          </p>
        </div>

        <div className="flex flex-row items-center space-x-8">
          <button
            onClick={() => setShowSpace(!showSpace)}
            className={`space-x-2 px-4 py-2 inline-flex items-center justify-center rounded-md border text-sm font-medium shadow-sm button-bg`}
          >
            <SVG
              src="/images/sparkles-icon.svg"
              className="w-4 h-4 fill-white"
            />
            <span>{showSpace ? "Close Portal" : "Open Portal"}</span>
          </button>

          <button onClick={handleResetSubmit} className="underline text-xs">
            Reset Workspace
          </button>
        </div>
      </div>

      {showSpace && <DynamicEmbeddedSpace spaceProps={spaceProps} />}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = await getToken({
    req: context.req,
  });

  if (!token?.sub) {
    return {
      notFound: true,
    };
  }

  const environmentToken = process.env.DYNAMIC_TEMPLATES_ENVIRONMENT_ID;
  if (!environmentToken) {
    console.error("Missing DYNAMIC_TEMPLATES_ENVIRONMENT_ID env var");
    throw "Missing DYNAMIC_TEMPLATES_ENVIRONMENT_ID env var";
  }

  const userId = token.sub;

  let existingSpace = await prismaClient.space.findUnique({
    where: {
      userId_type: {
        userId: token.sub,
        type: SpaceType.Dynamic,
      },
    },
  });

  if (!existingSpace) {
    const space = await createSpace({
      workflow: WorkflowType.Dynamic,
      userId,
      environmentId: environmentToken,
      spaceName: "HCM.show Dynamic",
      language: "en",
    });

    if (!space) {
      throw new Error("Failed to create dynamic space");
    }

    existingSpace = await SpaceRepo.createSpace({
      userId,
      flatfileData: space,
      type: SpaceType.Dynamic,
    });
  }

  let spaceData = await getSpace({
    workflow: WorkflowType.Dynamic,
    spaceId: existingSpace.flatfileSpaceId,
  });

  let workbook = await getWorkbook({
    workflow: WorkflowType.Dynamic,
    workbookId: spaceData?.primaryWorkbookId!,
  });

  // Hack to wait for workbook to be ready. Should move to frontend and poll.
  // Duplicated among embed and dynamic flows
  const timeInFive = DateTime.now().plus({ seconds: 5 });

  while (!(workbook || DateTime.now() > timeInFive)) {
    spaceData = await getSpace({
      workflow: WorkflowType.Dynamic,
      spaceId: existingSpace.flatfileSpaceId,
    });

    workbook = await getWorkbook({
      workflow: WorkflowType.Dynamic,
      workbookId: spaceData?.primaryWorkbookId!,
    });
  }

  if (!workbook) {
    return {
      redirect: {
        destination: "/activity-log?flash=error&message=Unable to get workbook",
        permanent: false,
      },
    };
  }

  const workbookConfig = {
    name: workbook.name || "HCM.show Dynamic Portal",
    sheets: workbook.sheets?.map((s) => {
      return {
        name: s.name,
        slug: s.config?.slug,
        fields: s.config?.fields,
      };
    }),
    actions: workbook.actions,
  };

  // console.log("workbook", JSON.stringify(workbook, null, 2));
  // console.log("workbookConfig", JSON.stringify(workbookConfig, null, 2));

  const dbCustomField = await prismaClient.customField.findFirst({
    where: {
      userId: token.sub,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      name: true,
      type: true,
      required: true,
      dateFormat: true,
      decimals: true,
      enumOptions: true,
    },
  });

  const props: Props = {
    environmentToken,
    workbookConfig,
    userId: token.sub,
    dbCustomField: dbCustomField
      ? ({
          name: dbCustomField.name,
          type: dbCustomField.type,
          required: dbCustomField.required,
          dateFormat: dbCustomField.dateFormat,
          decimals: dbCustomField.decimals || 0,
          enumOptions: dbCustomField.enumOptions,
        } as any as CustomField)
      : null,
  };

  return {
    props,
  };
};

export default DynamicTemplates;
