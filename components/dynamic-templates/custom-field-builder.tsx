import { FolderPlusIcon, SparklesIcon } from "@heroicons/react/24/outline";
import {
  CustomField,
  dateFormats,
  fieldTypes,
} from "../../pages/dynamic-templates";
import { OptionBuilder } from "./option-builder";
import toast from "react-hot-toast";
import { FormEvent } from "react";

type Props = {
  customField: CustomField;
  setCustomField: (customField: CustomField) => void;
  setForEmbedCustomField: any;
  setCustomFieldStatus: any;
};

export const CustomFieldBuilder = ({
  customField,
  setCustomField,
  setForEmbedCustomField,
  setCustomFieldStatus,
}: Props) => {
  const options = customField.enumOptions;
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const customField = JSON.parse(formData.get("customField") as string);
    const name = customField.name;
    const type = customField.type;
    const required = customField.required;
    const dateFormat = customField.dateFormat;
    const decimals = customField.decimals;

    try {
      const response = await fetch("/api/flatfile/save-custom-field", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          required,
          dateFormat,
          decimals,
        }),
      });

      const data = await response.json();
      const customField = {
        name: data.name,
        type: data.type,
        required: data.required,
        dateFormat: data.dateFormat,
        decimals: data.decimals,
        enumOptions: data.enumOptions,
      };

      setForEmbedCustomField(customField);
      console.log("custom field saved", customField);
    } catch (error) {
      console.error("Error saving custom field:", error);
    }
  };

  return (
    <div className="max-w-lg w-[33%]">
      <p className="text-lg font-semibold mb-1">Custom Field</p>

      <p className="text-xs text-gray-600 mb-8">
        Create your custom field and choose its data type and validations.
      </p>

      <label className="block font-semibold mb-1">Name</label>
      <input
        name="custom-field-name"
        type="text"
        className="border border-gray-200 rounded px-2 py-2 w-full mb-4"
        placeholder="Employee Birthdate"
        value={customField.name}
        onChange={(e) => {
          setCustomField({ ...customField, name: e.target.value });
        }}
      />

      <label className="block font-semibold mb-1">Type</label>
      <select
        name="custom-field-type"
        className="border border-gray-200 rounded px-2 py-2 w-full mb-4"
        value={customField.type}
        onChange={(e) => {
          setCustomField({
            ...customField,
            type: e.target.value as keyof typeof fieldTypes,
          });
        }}
      >
        {Object.keys(fieldTypes).map((key) => {
          return (
            <option key={key} value={key}>
              {fieldTypes[key as keyof typeof fieldTypes]}
            </option>
          );
        })}
      </select>

      <label className="block font-semibold mb-1">Validations</label>

      <div className="flex flex-row items-center mb-4">
        <input
          id="custom-field-required-validation"
          name="custom-field-required-validation"
          type="checkbox"
          className="mr-2"
          checked={customField.required}
          onChange={(e) => {
            setCustomField({ ...customField, required: e.target.checked });
          }}
        />
        <label
          htmlFor="custom-field-required-validation"
          className="block text-sm cursor-pointer"
        >
          Field is required
        </label>
      </div>

      {customField.type === "date" && (
        <div>
          <label className="block text-sm font-semibold mb-1">
            Date Format
          </label>
          <select
            name="custom-field-type"
            className="border border-gray-200 rounded px-2 py-2 w-1/2 mb-4"
            value={customField.dateFormat}
            onChange={(e) => {
              setCustomField({
                ...customField,
                dateFormat: e.target.value as keyof typeof dateFormats,
              });
            }}
          >
            {Object.keys(dateFormats).map((key) => {
              return (
                <option key={key} value={key}>
                  {dateFormats[key as keyof typeof dateFormats]}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {customField.type === "number" && (
        <div>
          <label className="block text-sm font-semibold mb-1">
            Decimal Places
          </label>
          <input
            name="number-decimal-places"
            type="number"
            min={0}
            step={1}
            className="border border-gray-200 rounded px-2 py-2 mb-4 w-16"
            placeholder="2"
            defaultValue={customField.decimals}
            onChange={(e) => {
              setCustomField({
                ...customField,
                decimals: parseInt(e.target.value),
              });
            }}
          />
        </div>
      )}

      {customField.type === "enum" && (
        <div>
          <label
            htmlFor="custom-field-required-validation"
            className="block text-sm cursor-pointer mb-2"
          >
            Category options
          </label>
          <OptionBuilder
            options={options.sort((a, b) => a.id - b.id)}
            updateInput={(option, value) => {
              const filteredOptions = options.filter((o) => {
                return o.id !== option.id;
              });

              setCustomField({
                ...customField,
                enumOptions: [...filteredOptions, { ...option, input: value }],
              });
            }}
            updateOutput={(option, value) => {
              const filteredOptions = options.filter((o) => {
                return o.id !== option.id;
              });

              setCustomField({
                ...customField,
                enumOptions: [...filteredOptions, { ...option, output: value }],
              });
            }}
            addNewOption={() => {
              const maxId = options.reduce((max, option) => {
                return Math.max(max, option.id);
              }, 0);

              setCustomField({
                ...customField,
                enumOptions: [
                  ...options,
                  { id: maxId + 1, input: "", output: "" },
                ],
              });
            }}
            removeOption={(option) => {
              const filteredObjects = options.filter((o) => {
                return o.id !== option.id;
              });

              setCustomField({
                ...customField,
                enumOptions: filteredObjects,
              });
            }}
          />
        </div>
      )}
      <form className="w-fit mt-10 mx-auto" onSubmit={handleSubmit}>
        <input
          type="hidden"
          id="customField"
          name="customField"
          value={JSON.stringify(customField)}
        />
        <button
          onClick={() => {
            toast.success("Saved Custom Field");
            setCustomFieldStatus("Saved");
          }}
          className="px-4 py-2 inline-flex items-center justify-center rounded-md border text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto bg-emerald-500 text-white border-transparent"
        >
          Save Custom Field
          <FolderPlusIcon className="w-4 h-4 ml-2" />
        </button>
      </form>
    </div>
  );
};
