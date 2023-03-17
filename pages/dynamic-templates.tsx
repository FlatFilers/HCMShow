import { NextPageWithLayout } from "./_app";
import { useCallback, useState } from "react";
import { useSpace, ISpaceConfig } from "@flatfile/react";
import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import { SparklesIcon } from "@heroicons/react/24/outline";
import {
  SpaceConfigWithBlueprints,
  getAccessToken,
  getSpaceConfig,
} from "../lib/flatfile";
import { OptionBuilder } from "../components/dynamic-templates/option-builder";
import { Property, SheetConfig } from "@flatfile/api";
import { CustomFieldBuilder } from "../components/dynamic-templates/custom-field-builder";

interface Props {
  accessToken: string;
  environmentId: string;
  workbookName: string;
  baseConfig: SpaceConfigWithBlueprints;
}

export interface CustomField {
  name: string;
  type: keyof typeof fieldTypes;
  required: boolean;
  dateFormat: keyof typeof dateFormats;
  decimals: number;
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

const initialOptions: Option[] = [
  { id: 1, input: "ft", output: "Full-Time" },
  { id: 2, input: "pt", output: "Part-Time" },
  { id: 3, input: "tm", output: "Temporary" },
  { id: 4, input: "ct", output: "Contract" },
];

const filterConfig = ({
  baseConfig,
  workbookName,
  options,
  customFieldConfig,
}: {
  baseConfig: SpaceConfigWithBlueprints;
  workbookName: string;
  options: Option[];
  customFieldConfig: any;
}) => {
  const blueprint = baseConfig.blueprints.find((b) => b.name === workbookName);
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

  const mappedOptions = options.map((option) => {
    return { value: option.input, label: option.output };
  });

  const filteredConfig = {
    ...baseConfig,
    blueprints: [
      ...otherBlueprints,
      {
        ...blueprint,
        sheets: [
          ...otherSheets,
          {
            ...sheet,
            fields: [
              ...otherFields,
              { ...field, config: { options: mappedOptions } },
              customFieldConfig,
            ],
          },
        ],
      },
    ],
  };

  console.log("filteredConfig", filteredConfig);

  return filteredConfig;
};

const DynamicTemplates: NextPageWithLayout<Props> = ({
  accessToken,
  environmentId,
  workbookName,
  baseConfig,
}) => {
  const [options, setOptions] = useState(initialOptions);
  const [showSpace, setShowSpace] = useState(false);
  const [customField, setCustomField] = useState<CustomField>({
    name: "Employee Birthdate",
    type: "date",
    required: true,
    dateFormat: "yyyy-mm-dd",
    decimals: 2,
  } as CustomField);

  const customFieldConfig = {
    key: customField.name?.replace(/\s/, ""),
    type: customField.type,
    label: customField.name,
    description: "Custom field",
    constraints: [{ type: "required" }],
  };

  const spaceProps: ISpaceConfig = {
    accessToken,
    environmentId,
    spaceConfig: filterConfig({
      baseConfig,
      workbookName,
      options,
      customFieldConfig,
    }),
    sidebarConfig: {
      showDataChecklist: false,
      showSidebar: false,
    },
  };
  const { error, data } = useSpace({ ...spaceProps });

  console.log("customFieldConfig", customFieldConfig);

  useCallback(() => {
    if (error) {
      setShowSpace(false);
    }
  }, [error]);

  return (
    <div className="ml-12 mt-16">
      <p className="text-2xl mb-2">Customize your workspace</p>
      <p className="mb-8 text-gray-600">
        Adjust the field options below, then click Open Portal to add your data.
      </p>

      <div className="flex flex-row mb-12">
        <CustomFieldBuilder
          customField={customField}
          setCustomField={setCustomField}
          fieldTypes={fieldTypes}
          dateFormats={dateFormats}
        />

        <div className="border-r border-gray-300 mx-12"></div>

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

            setOptions([...options, { id: maxId + 1, input: "", output: "" }]);
          }}
          removeOption={(option) => {
            const filteredObjects = options.filter((o) => {
              return o.id !== option.id;
            });

            setOptions(filteredObjects);
          }}
        />
      </div>

      <button
        onClick={() => setShowSpace(true)}
        className="px-4 py-2 inline-flex items-center justify-center rounded-md border text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto mb-6 bg-primary text-white border-transparent"
      >
        Generate Space
        <SparklesIcon className="w-4 h-4 ml-2" />
      </button>

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

  const accessToken = await getAccessToken();
  const baseConfig = await getSpaceConfig(accessToken);

  return {
    props: {
      accessToken,
      environmentId: process.env.FLATFILE_ENVIRONMENT_ID,
      workbookName: process.env.WORKBOOK_UPLOAD_WORKBOOK_NAME,
      baseConfig,
    },
  };
};

export default DynamicTemplates;
