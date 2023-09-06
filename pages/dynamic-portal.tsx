import { NextPageWithLayout } from "./_app";
import { FormEvent, useState, useRef } from "react";
import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import {
  ArrowPathRoundedSquareIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsPointingInIcon,
  BoltIcon,
  CodeBracketIcon,
  ExclamationCircleIcon,
  PuzzlePieceIcon,
  SparklesIcon,
  VariableIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { OptionBuilder } from "../components/dynamic-templates/option-builder";
import { CustomFieldBuilder } from "../components/dynamic-templates/custom-field-builder";
import toast from "react-hot-toast";
import { workflowItems } from "../components/sidebar-layout";
import FeaturesList from "../components/shared/features-list";
import { DateTime } from "luxon";
import { useOnClickOutside } from "../lib/hooks/usehooks";
import { Prisma } from "@prisma/client";
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
import { Property } from "@flatfile/api/api";
import { FlatfileSpaceData } from "../lib/flatfile";

import dynamic from "next/dynamic";

const DynamicEmbeddedSpace = dynamic(
  () => import("../components/shared/embedded-space"),
  {
    loading: () => <div></div>,
    ssr: false,
  }
);

const features = {
  "Event-based workflow": ExclamationCircleIcon,
  "Dynamically update configuration": CodeBracketIcon,
  "Plug-in functionality": PuzzlePieceIcon,
  "Custom actions": BoltIcon,
  "External API calls": ArrowTopRightOnSquareIcon,
  "Custom Theming": VariableIcon,
  "Data Hooks": SparklesIcon,
};

interface Props {
  environmentToken: string;
  workbookConfig: Flatfile.CreateWorkbookConfig;
  userId: string;
  dbCustomField: CustomField;
  dbCustomOptions: Option[];
  initialCustomFieldLastSavedAt: string;
  initialCustomOptionsLastSavedAt: string;
}

export interface CustomField {
  name: string;
  type: keyof typeof fieldTypes;
  required: boolean;
  dateFormat: keyof typeof dateFormats;
  decimals: number;
  enumOptions: Option[];
}

export const fieldTypes = {
  string: "Text",
  number: "Number",
  date: "Date",
  enum: "Category",
  boolean: "Checkbox",
};

export const dateFormats = {
  "yyyy-mm-dd": "yyyy-mm-dd",
  "mm-dd-yyyy": "mm-dd-yyyy",
  "dd-mm-yyyy": "dd-mm-yyyy",
};

export interface Option {
  id: number;
  input: string;
  output: string;
}

export const initialOptions: Option[] = [
  {
    id: 1,
    input: "Insurance_Coverage_Type_Insurance",
    output: "Insurance",
  },

  {
    id: 2,
    input: "Health_Care_Coverage_Type_Medical",
    output: "Medical",
  },
  {
    id: 3,
    input: "Health_Care_Coverage_Type_Dental",
    output: "Dental",
  },
  {
    id: 4,
    input: "Retirement_Savings_Coverage_Type_Retirement",
    output: "Retirement",
  },
  {
    id: 5,
    input: "Additional_Benefits_Coverage_Type_Other",
    output: "Other",
  },
];

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

const filterConfig = ({
  workbookConfig,
  forEmbedOptions,
  customFieldConfig,
}: {
  workbookConfig: Flatfile.CreateWorkbookConfig;
  forEmbedOptions: Option[];
  customFieldConfig: any;
}) => {
  const dynamicFieldType = "benefitCoverageType";
  const { name, sheets, actions } = workbookConfig;

  if (!sheets) {
    console.log("The workbook has no sheets. Unable to filter config.");

    return workbookConfig;
  }

  const { name: sheetName, slug } = sheets[0];
  const otherFields = sheets[0].fields.filter((f) => {
    return f.key !== dynamicFieldType;
  }) as Property[];
  const field = sheets[0].fields.find((f) => f.key === dynamicFieldType);
  const filteredConfig = {
    name,
    sheets: [
      {
        name: sheetName,
        slug,
        fields: [
          ...otherFields,
          {
            ...field,
            ...(forEmbedOptions && customOptionsConfig(forEmbedOptions)),
            slug: `${field?.key}-${Date.now()}`,
          },
          ...(customFieldConfig.forEmbed === true ? [customFieldConfig] : []),
        ],
      },
    ],
    actions,
  };
  // console.log("filteredConfig", filteredConfig);
  // console.log("sheets", filteredConfig.sheets[0].fields);

  return filteredConfig;
};

const DynamicTemplates: NextPageWithLayout<Props> = ({
  environmentToken,
  workbookConfig,
  userId,
  dbCustomField,
  dbCustomOptions,
  initialCustomFieldLastSavedAt,
  initialCustomOptionsLastSavedAt,
}) => {
  const [showSpace, setShowSpace] = useState(false);
  const [options, setOptions] = useState(dbCustomOptions ?? initialOptions);
  const [customField, setCustomField] = useState<CustomField>(
    dbCustomField ??
      ({
        name: "Employee Birthdate",
        type: "date",
        required: true,
        dateFormat: "yyyy-mm-dd",
        decimals: 2,
        enumOptions: initialOptions,
      } as CustomField)
  );

  const [customFieldLastSavedAt, setCustomFieldLastSavedAt] = useState<string>(
    initialCustomFieldLastSavedAt
  );
  const [customOptionsLastSavedAt, setCustomOptionsLastSavedAt] =
    useState<string>(initialCustomOptionsLastSavedAt);

  const [forEmbedCustomField, setForEmbedCustomField] =
    useState<CustomField | null>(dbCustomField ?? null);
  const [forEmbedOptions, setForEmbedOptions] = useState<Option[]>(
    dbCustomOptions ?? initialOptions
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
    forEmbed: forEmbedCustomField ? true : false,
  };

  const publishableKey = process.env.NEXT_PUBLIC_DYNAMIC_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error("Missing NEXT_PUBLIC_DYNAMIC_PUBLISHABLE_KEY env var");
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
  const spaceProps = {
    error,
    publishableKey,
    environmentId: environmentToken,
    name: "Dynamic Portal",
    // IMPORTANT NOTE: If there are any changes to the theme or document set below,
    // you must update the theme and document in the adjoining index.ts file in hcm-show-config as well
    themeConfig: theme("#E28170", "#D64B32"),
    document: document,
    workbook: filterConfig({
      workbookConfig,
      forEmbedOptions,
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

  const handleOptionsSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const options = JSON.parse(formData.get("options") as string);

    try {
      const response = await fetch("/api/flatfile/save-options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          options,
        }),
      });

      const data = await response.json();
      setForEmbedOptions(data);
      setCustomOptionsLastSavedAt(DateTime.now().toFormat("MM/dd/yyyy h:mm a"));
      console.log("options saved", data);
    } catch (error) {
      console.error("Error saving options:", error);
    }
  };

  const dynamicPortalItem = workflowItems().find(
    (i) => i.slug === "dynamic-portal"
  )!;

  const handleResetSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (confirm("Reset field and field options?")) {
        const response = await fetch("/api/v1/reset-workspace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        setCustomField({
          name: "Employee Birthdate",
          type: "date",
          required: true,
          dateFormat: "yyyy-mm-dd",
          decimals: 2,
          enumOptions: initialOptions,
        } as CustomField);
        setOptions(initialOptions);
        setForEmbedCustomField(null);
        setForEmbedOptions(initialOptions);
        setCustomOptionsLastSavedAt("");
        setCustomFieldLastSavedAt("");
        toast.success("Workspace Reset");
      }
    } catch (error) {
      console.error("Error Resetting Workspace:", error);
    }
  };

  const modalRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(modalRef, () => setShowSpace(false));

  return (
    <div className="ml-12 mt-16">
      <div className="max-w-5xl">
        <div className="mb-12">
          <div
            className={`border-t-[6px] w-12 mb-2 ${dynamicPortalItem.color}`}
          ></div>
          <p className="text-sm font-semibold">{dynamicPortalItem.name}</p>
        </div>
        <div className="flex flex-row justify-between">
          <div>
            <p className="text-2xl mb-2">Customize your workspace</p>
            <p className="mb-8 text-gray-600 max-w-xl text-sm">
              Adjust the field options below. Save each as you complete them and
              then click Open Portal to add your data.
            </p>

            <div className="flex flex-row justify-between mb-12">
              <div className="max-w-lg">
                <div className="mb-12">
                  <CustomFieldBuilder
                    customField={customField}
                    setCustomField={setCustomField}
                    setForEmbedCustomField={setForEmbedCustomField}
                    lastSavedAt={customFieldLastSavedAt}
                    setLastSavedAt={() => {
                      setCustomFieldLastSavedAt(
                        DateTime.now().toFormat("MM/dd/yyyy h:mm a")
                      );
                    }}
                  />
                </div>

                <div className="flex flex-col mb-8">
                  <p className="font-semibold mb-1">Adjust category values</p>
                  <p className="text-xs text-gray-600 mb-4">
                    Make sure to adjust the category values in HCM Show as per
                    the evolving specific offerings of the organization and
                    ensure that these updates are also reflected in the
                    Flatfile.
                  </p>

                  <div className="">
                    <OptionBuilder
                      options={options.sort((a, b) => a.id - b.id)}
                      updateInput={(option, value) => {
                        const filteredOptions = options.filter((o) => {
                          return o.id !== option.id;
                        });

                        setOptions([
                          ...filteredOptions,
                          { ...option, input: value },
                        ]);
                      }}
                      updateOutput={(option, value) => {
                        const filteredOptions = options.filter((o) => {
                          return o.id !== option.id;
                        });

                        setOptions([
                          ...filteredOptions,
                          { ...option, output: value },
                        ]);
                      }}
                      addNewOption={() => {
                        const maxId = options.reduce((max, option) => {
                          return Math.max(max, option.id);
                        }, 0);

                        setOptions([
                          ...options,
                          { id: maxId + 1, input: "", output: "" },
                        ]);
                      }}
                      removeOption={(option) => {
                        const filteredObjects = options.filter((o) => {
                          return o.id !== option.id;
                        });

                        setOptions(filteredObjects);
                      }}
                    />
                  </div>

                  <form className="" onSubmit={handleOptionsSubmit}>
                    <input
                      type="hidden"
                      id="options"
                      name="options"
                      value={JSON.stringify(options)}
                    />

                    <div className="flex flex-row items-center">
                      <button
                        onClick={() => {
                          toast.success("Saved Options");
                        }}
                        className="px-4 py-1 inline-flex items-center justify-center rounded-md text-xs font-medium shadow-sm border border-dynamic-portal text-dynamic-portal hover:bg-dynamic-portal hover:text-white"
                      >
                        Save Options
                      </button>

                      {customOptionsLastSavedAt && (
                        <p className="text-[10px] text-gray-400 ml-4">
                          Saved {customOptionsLastSavedAt}
                        </p>
                      )}
                    </div>
                  </form>
                </div>

                <div className="border-r border-gray-300 mx-12"></div>

                <div className="flex flex-col">
                  <div className="flex flex-col mb-12">
                    <div className="">
                      <form className="w-full" onSubmit={handleResetSubmit}>
                        <button className="flex flex-row items-center text-sm underline text-gray-400">
                          Reset customizations
                          <ArrowPathRoundedSquareIcon className="w-5 h-5 ml-2" />
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="">
                    <p className="text-xl font-semibold mb-1">
                      Generate your workspace
                    </p>
                    <p className="text-xs text-gray-600 mb-4">
                      Click below to generate your workspace, then scroll down
                      to add your data.
                    </p>
                    <button
                      onClick={() => setShowSpace(!showSpace)}
                      className={`px-4 py-2 inline-flex items-center justify-center rounded-md border text-sm font-medium shadow-sm ${
                        showSpace
                          ? "bg-white text-dynamic-portal border-2 border-dynamic-portal"
                          : "bg-dynamic-portal text-white border-transparent"
                      }`}
                    >
                      {showSpace ? "Close Portal" : "Open Portal"}
                      {showSpace ? (
                        <ArrowsPointingInIcon className="w-4 h-4 ml-2" />
                      ) : (
                        <SparklesIcon className="w-4 h-4 ml-2" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <FeaturesList
            type="dynamic-portal"
            githubUrl="https://github.com/FlatFilers/hcm-show-config/blob/main/workflows/dynamic/index.ts"
            features={features}
          />

          {showSpace && <DynamicEmbeddedSpace spaceProps={spaceProps} />}
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = await getToken({
    req: context.req,
  });

  if (!token?.sub) {
    console.log("No session token found");

    return {
      notFound: true,
    };
  }

  const prisma = prismaClient;

  const environmentToken = process.env.DYNAMIC_TEMPLATES_ENVIRONMENT_ID;
  if (!environmentToken) {
    console.error("Missing DYNAMIC_TEMPLATES_ENVIRONMENT_ID env var");
    throw "Missing DYNAMIC_TEMPLATES_ENVIRONMENT_ID env var";
  }

  const userId = token.sub;

  let existingSpace = await prisma.space.findUnique({
    where: {
      userId_type: {
        userId: token.sub,
        type: SpaceType.Dynamic,
      },
    },
    select: {
      flatfileData: true,
    },
  });

  // console.log("existingSpace", existingSpace);

  if (!existingSpace) {
    const space = await createSpace({
      workflow: WorkflowType.Dynamic,
      userId,
      environmentId: environmentToken,
      spaceName: "HCM.show Dynamic",
    });

    if (!space) {
      throw new Error("Failed to create dynamic space");
    }

    existingSpace = await SpaceRepo.createSpace({
      userId,
      flatfileSpaceId: space.id,
      flatfileData: space,
      type: SpaceType.Dynamic,
    });
  }

  let spaceData = await getSpace({
    workflow: WorkflowType.Dynamic,
    spaceId: (existingSpace?.flatfileData as unknown as FlatfileSpaceData).id,
  });

  // console.log("spaceData", spaceData);

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
      spaceId: (existingSpace?.flatfileData as unknown as FlatfileSpaceData).id,
    });

    workbook = await getWorkbook({
      workflow: WorkflowType.Dynamic,
      workbookId: spaceData?.primaryWorkbookId!,
    });
  }

  if (!workbook) {
    // console.log("Unable to get workbook");
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

  const dbFullCustomField = await prisma.customField.findFirst({
    where: {
      userId: token.sub,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const dbCustomField = await prisma.customField.findFirst({
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

  const dbCustomOptionsRecord = await prisma.options.findFirst({
    where: {
      userId: token.sub,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const dbCustomOptions = dbCustomOptionsRecord?.options || null;

  return {
    props: {
      environmentToken,
      workbookConfig,
      userId: token.sub,
      dbCustomField,
      dbCustomOptions,
      initialCustomFieldLastSavedAt: dbFullCustomField
        ? DateTime.fromJSDate(dbFullCustomField.updatedAt).toFormat(
            "MM/dd/yyyy h:mm a"
          )
        : "",
      initialCustomOptionsLastSavedAt: dbCustomOptionsRecord
        ? DateTime.fromJSDate(dbCustomOptionsRecord.updatedAt).toFormat(
            "MM/dd/yyyy h:mm a"
          )
        : "",
    },
  };
};

export default DynamicTemplates;
