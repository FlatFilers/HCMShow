import { NextPageWithLayout } from "./_app";
import { FormEvent, useCallback, useState, useEffect } from "react";
import { useSpace } from "@flatfile/react";
import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import {
  ArrowsPointingInIcon,
  FolderPlusIcon,
  SparklesIcon,
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

interface Props {
  accessToken: string;
  environmentId: string;
  workbookName: string;
  baseConfig: SpaceConfigWithBlueprints;
  dbCustomField: CustomField;
  dbCustomOptions: Option[];
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
  // TODO: We should look up blueprint by ID or slug not name
  const blueprint = baseConfig.blueprints.find(
    (b) => b.name === workbookName
  ) as BlueprintWithId;
  const sheet = blueprint?.sheets.find((s) => s.name === "Employees");
  const field = sheet?.fields.find((f) => f.key === "employeeType");

  const otherBlueprints = baseConfig.blueprints.filter((b) => {
    return b.name !== workbookName;
  });
  const otherSheets = blueprint?.sheets.filter((s) => {
    return s.name !== "Employees";
  }) as SheetConfig[];
  const otherFields = sheet?.fields.filter((f) => {
    return f.key !== "employeeType";
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
  const [customFieldStatus, setCustomFieldStatus] = useState<string>(
    dbCustomField ? "Saved" : "None"
  );
  const [optionsStatus, setOptionsStatus] = useState<string>(
    dbCustomOptions ? "Saved" : "Default"
  );
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

  // console.log("customFieldConfig", customFieldConfig);
  useCallback(() => {
    if (error) {
      setShowSpace(false);
    }
  }, [error]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const options = JSON.parse(formData.get("options") as string);

    console.log("options", options);

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
      console.log("options saved", data);
    } catch (error) {
      console.error("Error saving options:", error);
    }
  };

  return (
    <div className="ml-12 mr-16 mt-16 flex flex-col">
      <p className="text-2xl mb-2">Customize your workspace</p>
      <p className="mb-8 text-gray-600">
        Adjust the field options below. Save each as you complete them and then
        click Generate Space to add your data.
      </p>

      <div className="flex flex-row mb-12 w-full">
        <CustomFieldBuilder
          customField={customField}
          setCustomField={setCustomField}
          setForEmbedCustomField={setForEmbedCustomField}
          setCustomFieldStatus={setCustomFieldStatus}
        />

        <div className="border-r border-gray-300 mx-12"></div>

        <div className="flex flex-col w-[33%]">
          <p className="text-lg font-semibold mb-4">
            Adjust Employee Type Options
          </p>

          <OptionBuilder
            options={options.sort((a, b) => a.id - b.id)}
            updateInput={(option, value) => {
              const filteredOptions = options.filter((o) => {
                return o.id !== option.id;
              });

              setOptions([...filteredOptions, { ...option, input: value }]);
            }}
            updateOutput={(option, value) => {
              const filteredOptions = options.filter((o) => {
                return o.id !== option.id;
              });

              setOptions([...filteredOptions, { ...option, output: value }]);
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
          <form className="w-fit mt-10 mx-auto my-auto" onSubmit={handleSubmit}>
            <input
              type="hidden"
              id="options"
              name="options"
              value={JSON.stringify(options)}
            />
            <button
              onClick={() => {
                toast.success("Saved Options");
                setOptionsStatus("Saved");
              }}
              className="px-4 py-2 inline-flex items-center justify-center rounded-md border text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto bg-emerald-500 text-white border-transparent"
            >
              Save Options
              <FolderPlusIcon className="w-4 h-4 ml-2" />
            </button>
          </form>
        </div>

        <div className="border-r border-gray-300 mx-12"></div>

        <div className="flex flex-col w-[33%]">
          <div className="flex flex-col flex-grow">
            <p className="text-lg font-semibold mb-1">
              Generate your workspace
            </p>
            <p className="text-xs text-gray-600 mb-8">
              Click below to generate your workspace, then scroll down to add
              your data.
            </p>
            <div className="max-w-[50%]">
              <div className="font-semibold mb-6">Workspace Save Status:</div>
              <div className="mb-2 flex flex-row justify-between">
                <div className="mr-2">Custom Field:</div>
                <div
                  className={`text-right ${
                    customFieldStatus === "None"
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {customFieldStatus}
                </div>
              </div>
              <div className="mb-2 flex flex-row justify-between">
                <div className="mr-2">Options:</div>
                <div
                  className={`text-right ${
                    optionsStatus === "Default"
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {optionsStatus}
                </div>
              </div>
            </div>
          </div>
          <div className="w-fit h-[33%] mx-auto">
            <button
              onClick={() => setShowSpace(!showSpace)}
              className={`px-4 py-2 inline-flex items-center justify-center rounded-md border text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto mt-4 ${
                showSpace
                  ? "bg-white text-primary border-2 border-primary"
                  : "bg-primary text-white border-transparent"
              }`}
            >
              {showSpace ? "Close Portal" : "Generate New Space"}
              {showSpace ? (
                <ArrowsPointingInIcon className="w-4 h-4 ml-2" />
              ) : (
                <SparklesIcon className="w-4 h-4 ml-2" />
              )}
            </button>
          </div>
        </div>
      </div>

      {error && <div>{error}</div>}
      {!error && showSpace && (
        <div>
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

  const dbCustomField = await prisma.customField?.findFirst({
    where: {
      userId: token.sub,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const dbCustomOptionsRecord = await prisma.options?.findFirst({
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
    },
  };
};

export default DynamicTemplates;
