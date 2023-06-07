import { NextPageWithLayout } from "./_app";
import { FormEvent, useCallback, useState, useRef } from "react";
import { IThemeConfig, useSpace } from "@flatfile/react";
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
import { SpaceConfigWithBlueprints, getSpaceConfig } from "../lib/flatfile";
import { OptionBuilder } from "../components/dynamic-templates/option-builder";
import { CustomFieldBuilder } from "../components/dynamic-templates/custom-field-builder";
import toast from "react-hot-toast";
import { prismaClient } from "../lib/prisma-client";
import { workflowItems } from "../components/sidebar-layout";
import FeaturesList from "../components/shared/features-list";
import { theme } from "../lib/theme";
import { DateTime } from "luxon";
import { useOnClickOutside } from "../lib/hooks/usehooks";
import {
  FlowTypes,
  getWorkbook,
  listSpaces,
  listWorkbooks,
} from "../lib/new-flatfile";
import { Portal } from "../components/dynamic-templates/portal";
import {
  Action,
  ActionMode,
  Property,
  SheetConfig,
  StringConfigOptions,
  StringConfig,
} from "@flatfile/api/api";
import { Flatfile } from "@flatfile/api";

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
  environmentId: string;
  workbookConfig: Flatfile.CreateWorkbookConfig;
  workbookName: string;
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
  const sheetSlug = "benefit-elections-sheet";
  const dynamicFieldType = "benefitCoverageType";

  const sheet = workbookConfig.sheets?.find((s) => s.slug === sheetSlug);

  if (!sheet) {
    throw "TODO - no sheet";
  }

  const field = sheet.fields.find((f) => f.key === dynamicFieldType);

  if (!field) {
    throw "TODO - no field";
  }

  return {
    ...workbookConfig,
    sheets: [
      {
        ...sheet,
        fields: [
          ...sheet.fields,
          {
            ...field,
            ...(customFieldConfig.type === "enum" &&
              forEmbedOptions &&
              customOptionsConfig(forEmbedOptions)),
            slug: `${field.key}-${Date.now()}`,
          },
        ],
      },
    ],
  };

  // TODO: do we still need this?
  // if (customFieldConfig.forEmbed) {
  //   filteredConfig.blueprints
  //     .at(-1)
  //     ?.sheets.at(-1)
  //     ?.fields.push(customFieldConfig);
  // }
};

const DynamicTemplates: NextPageWithLayout<Props> = ({
  environmentId,
  workbookConfig,
  workbookName,
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

  const spaceProps = {
    environmentId,
    name: "Dynamic Portal",
    publishableKey,
    workbook: workbookConfig,
    // workbook: filterConfig({
    //   workbookConfig,
    //   forEmbedOptions,
    //   customFieldConfig,
    // }),
    themeConfig: theme("#E28170", "#D64B32") as IThemeConfig,
    // spaceConfig: filterConfig({
    //   forEmbedOptions,
    //   customFieldConfig,
    // }),
    sidebarConfig: {
      showDataChecklist: false,
      showSidebar: false,
    },
  };

  // const { error, data } = useSpace({ ...spaceProps });

  // useCallback(() => {
  //   if (error) {
  //     setShowSpace(false);
  //   }
  // }, [error]);

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

  // const modalRef = useRef<HTMLDivElement | null>(null);

  // useOnClickOutside(modalRef, () => setShowSpace(false));

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
            githubUrl="https://github.com/FlatFilers/hcm-show-config/blob/main/src/workflows/dynamic-templates/index.ts"
            features={features}
          />
        </div>
      </div>

      {showSpace && (
        <Portal
          closeSpace={() => setShowSpace(false)}
          spaceProps={spaceProps}
        />
      )}
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

  const dbCustomField = await prisma.customField.findFirst({
    where: {
      userId: token.sub,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let updatedDbCustomField = null;
  if (dbCustomField) {
    updatedDbCustomField = {
      ...dbCustomField,
      createdAt: DateTime.fromJSDate(dbCustomField?.createdAt as Date)
        .toFormat("MM/dd/yy hh:mm:ss a")
        .toString(),
      updatedAt: DateTime.fromJSDate(dbCustomField?.updatedAt)
        .toFormat("MM/dd/yy hh:mm:ss a")
        .toString(),
    };
  }
  const dbCustomOptionsRecord = await prisma.options.findFirst({
    where: {
      userId: token.sub,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const dbCustomOptions = dbCustomOptionsRecord
    ? dbCustomOptionsRecord.options
    : null;

  const environmentId = process.env.DYNAMIC_TEMPLATES_ENVIRONMENT_ID as string;

  const environmentSpaces = await listSpaces({
    flowName: FlowTypes.Dynamic,
    environmentId,
  });

  // console.log("environmentSpaces", environmentSpaces);

  // const currentSpace = environmentSpaces?.data.sort((a: any, b: any) => {
  //   return b.createdAt - a.createdAt;
  // })[0];

  // console.log("currentSpace", currentSpace);

  // const spaceId = currentSpace?.id as string;

  // const getWorkbooks = await listWorkbooks({
  //   flowName: FlowTypes.Dynamic,
  //   spaceId,
  // });

  // console.log("getWorkbooks", getWorkbooks);

  // const currentWorkbook = getWorkbooks?.data.sort((a: any, b: any) => {
  //   return b.createdAt - a.createdAt;
  // })[0];

  // console.log("currentWorkbook", currentWorkbook);

  // const sheets = currentWorkbook?.sheets;

  // console.log("sheets", sheets);

  // const blueprintSheets = sheets ? sheets[0] : null;

  // console.log("blueprintSheets", blueprintSheets);

  // TODO: How do we get this if we don't have a space already created?
  const workbook = await getWorkbook("us_wb_RXibxLil");

  if (!workbook) {
    throw "TODO: no workbook found";
  }

  console.log("workbook", JSON.stringify(workbook, null, 2));

  // existingSpace?.flatfileData as unknown as FlatfileSpaceData;
  // console.log("existingSpace", existingSpace);

  const workbookConfig = {
    name: workbook?.name || "HCM.show Embedded Portal",
    sheets:
      workbook?.sheets?.map((s) => {
        return {
          name: s.name,
          slug: s.config?.slug,
          fields: s.config?.fields,
        };
      }) || null,
    actions: workbook?.actions || null,
  };

  console.log("workbookConfig", JSON.stringify(workbookConfig, null, 2));
  return {
    props: {
      environmentId,
      workbookConfig,
      workbookName: process.env.DYNAMIC_TEMPLATES_WORKBOOK_NAME,
      updatedDbCustomField,
      dbCustomOptions,
      initialCustomFieldLastSavedAt: dbCustomField
        ? DateTime.fromJSDate(dbCustomField.updatedAt).toFormat(
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
