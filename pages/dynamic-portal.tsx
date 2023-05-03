import { NextPageWithLayout } from "./_app";
import { FormEvent, useCallback, useState } from "react";
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
} from "@heroicons/react/24/outline";
import {
  BlueprintWithId,
  SpaceConfigWithBlueprints,
  getAccessToken,
  getSpaceConfig,
} from "../lib/flatfile";
import { OptionBuilder } from "../components/dynamic-templates/option-builder";
import { Property, SheetConfig } from "@flatfile/api";
import { CustomFieldBuilder } from "../components/dynamic-templates/custom-field-builder";
import toast from "react-hot-toast";
import { prismaClient } from "../lib/prisma-client";
import { workflowItems } from "../components/sidebar-layout";
import FeaturesList from "../components/shared/features-list";
import { theme } from "../lib/theme";
import { DateTime } from "luxon";

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
  accessToken: string;
  environmentId: string;
  workbookName: string;
  baseConfig: SpaceConfigWithBlueprints;
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
  { id: 1, input: "ft", output: "Full-Time" },
  { id: 2, input: "pt", output: "Part-Time" },
  { id: 3, input: "tm", output: "Temporary" },
  { id: 4, input: "ct", output: "Contract" },
];

const filterConfig = ({
  baseConfig,
  workbookName,
  forEmbedOptions,
  customFieldConfig,
}: {
  baseConfig: SpaceConfigWithBlueprints;
  workbookName: string;
  forEmbedOptions: Option[];
  customFieldConfig: any;
}) => {
  const sheetName = "Benefit Elections";
  const dynamicFieldType = "benefitCoverageType";

  // TODO: We should look up blueprint by ID or slug not name
  const blueprint = baseConfig.blueprints.find(
    (b) => b.name === workbookName
  ) as BlueprintWithId;
  const sheet = blueprint?.sheets.find((s) => s.name === sheetName);
  const field = sheet?.fields.find((f) => f.key === dynamicFieldType);

  const otherBlueprints = baseConfig.blueprints.filter((b) => {
    return b.name !== workbookName;
  });
  const otherSheets = blueprint?.sheets.filter((s) => {
    return s.name !== sheetName;
  }) as SheetConfig[];
  const otherFields = sheet?.fields.filter((f) => {
    return f.key !== dynamicFieldType;
  }) as Property[];

  const mappedOptions = forEmbedOptions.map((option) => {
    return { value: option.input, label: option.output };
  });

  const { id: _baseConfigId, ...baseConfigWithoutId } = baseConfig;
  const { id: _blueprintId, ...blueprintWithoutId } = blueprint;

  const filteredConfig = {
    ...baseConfigWithoutId,
    name: "HCM Show - Dynamic Templates",
    slug: `${baseConfig.slug}-${Date.now()}`,
    blueprints: [
      ...otherBlueprints,
      {
        ...blueprintWithoutId,
        slug: `${blueprint.slug}-${Date.now()}`,
        sheets: [
          ...otherSheets,
          {
            ...sheet,
            fields: [
              ...otherFields,
              {
                ...field,
                config: { options: mappedOptions },
                slug: `${field?.key}-${Date.now()}`,
              },
            ],
          },
        ],
      },
    ],
  };

  if (customFieldConfig.forEmbed) {
    filteredConfig.blueprints
      .at(-1)
      ?.sheets.at(-1)
      ?.fields.push(customFieldConfig);
  }

  // console.log("filteredConfig", filteredConfig);
  // console.log("field", field);
  // console.log("otherFields", otherFields);
  // console.log("mappedOptions", mappedOptions);
  // console.log("sheets", filteredConfig.blueprints[0].sheets[1]);
  // console.log(
  //   "single field",
  //   filteredConfig.blueprints[0].sheets[1].fields[13]
  // );

  return filteredConfig;
};

const DynamicTemplates: NextPageWithLayout<Props> = ({
  accessToken,
  environmentId,
  workbookName,
  baseConfig,
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
    forEmbed: forEmbedCustomField ? true : false,
  };

  const spaceProps = {
    accessToken,
    environmentId,
    name: "Dynamic Portal",
    themeConfig: theme("#E28170", "#D64B32") as IThemeConfig,
    spaceConfig: filterConfig({
      baseConfig,
      workbookName,
      forEmbedOptions,
      customFieldConfig,
    }),
    sidebarConfig: {
      showDataChecklist: false,
      showSidebar: false,
    },
  };

  const { error, data } = useSpace({ ...spaceProps });

  useCallback(() => {
    if (error) {
      setShowSpace(false);
    }
  }, [error]);

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
              <div className="max-w-md">
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

      {error && <div>{error}</div>}
      {!error && showSpace && (
        <div className="mr-16">
          <div>{data?.component}</div>
        </div>
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

  const accessToken = await getAccessToken({
    clientId: process.env.DYNAMIC_TEMPLATES_CLIENT_ID as string,
    secret: process.env.DYNAMIC_TEMPLATES_CLIENT_SECRET as string,
  });
  const baseConfig = await getSpaceConfig(accessToken);

  const prisma = prismaClient;

  const dbCustomField = await prisma.customField.findFirst({
    where: {
      userId: token.sub,
    },
    orderBy: {
      createdAt: "desc",
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

  const dbCustomOptions = dbCustomOptionsRecord?.options;

  return {
    props: {
      accessToken,
      environmentId: process.env.DYNAMIC_TEMPLATES_ENVIRONMENT_ID,
      workbookName: process.env.DYNAMIC_TEMPLATES_WORKBOOK_NAME,
      baseConfig,
      dbCustomField,
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
