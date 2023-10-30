import { FolderPlusIcon, SparklesIcon } from "@heroicons/react/24/outline";
import {
  CustomField,
  dateFormats,
  fieldTypes,
  initialOptions,
} from "../../pages/dynamic-portal";
import { OptionBuilder } from "./option-builder";
import toast from "react-hot-toast";
import { FormEvent, useState } from "react";
import { DateTime } from "luxon";

type Props = {
  customField: CustomField;
  setCustomField: (customField: CustomField) => void;
  setForEmbedCustomField: any;
  lastSavedAt: string;
  setLastSavedAt: Function;
};

export const CustomFieldBuilder = ({
  customField,
  setCustomField,
  setForEmbedCustomField,
  lastSavedAt,
  setLastSavedAt,
}: Props) => {
  if (!customField.enumOptions) {
    customField.enumOptions = initialOptions;
  }

  const options = customField.enumOptions;

  // console.log("options", options);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const { name, type, required, dateFormat, decimals, enumOptions } =
      JSON.parse(formData.get("customField") as string);

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
          enumOptions,
        }),
      });

      const data = await response.json();
      // console.log("data", data);

      const customField = {
        name: data.name,
        type: data.type,
        required: data.required,
        dateFormat: data.dateFormat,
        decimals: data.decimals,
        enumOptions: data.enumOptions,
      };

      setForEmbedCustomField(customField);
      setLastSavedAt();
      console.log("custom field saved", customField);
    } catch (error) {
      console.error("Error saving custom field:", error);
    }
  };

  return (
    <div
      className="grid grid-cols-3 card-bg card-sm space-x-2 text-sm items-center"
      style={{
        boxShadow:
          "8.74046516418457px 9.711627960205078px 18.45209312438965px 0px rgba(61, 73, 100, 0.3) inset",
        backgroundColor: "white",
      }}
    >
      <input
        name="custom-field-name"
        type="text"
        className="text-gray-900 border border-gray-900 text-sm rounded px-2 py-2"
        placeholder="Birthdate"
        value={customField.name}
        onChange={(e) => {
          setCustomField({ ...customField, name: e.target.value });
        }}
      />

      <select
        name="custom-field-type"
        className="border border-gray-900 text-gray-900 text-sm rounded px-2 py-2"
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

      <div className="flex flex-row items-center justify-between">
        <input
          id="custom-field-required-validation"
          name="custom-field-required-validation"
          className="inline-flex justify-self-start border border-gray-900"
          type="checkbox"
          checked={customField.required}
          onChange={(e) => {
            setCustomField({ ...customField, required: e.target.checked });
          }}
        />

        <form className="" onSubmit={handleSubmit}>
          <input
            type="hidden"
            id="customField"
            name="customField"
            value={JSON.stringify(customField)}
          />

          <div className="flex flex-row items-center space-x-2">
            <button
              onClick={() => {
                toast.success("Saved Custom Field");
              }}
              className="button-bg button-sm button-dynamic-portal inline-flex items-center justify-center rounded-md text-xs font-medium shadow-sm"
              style={{
                boxShadow:
                  "8.74046516418457px 9.711627960205078px 18.45209312438965px 0px rgba(61, 73, 100, 0.3) inset",
              }}
            >
              Save
            </button>

            {lastSavedAt && (
              <p className="text-[10px] text-gray-400 ml-4">
                Saved {lastSavedAt}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="">
      <p className="font-semibold mb-1">Customize Fields</p>

      <p className="text-xs text-gray-400 mb-4">
        Create a custom field in HCM Show that captures the organization's
        specific requirements beyond the standard fields and ensure that it is
        reflected in the Flatfile.
      </p>

      <div className="flex flex-row items-center">
        <div className="mr-2">
          <label className="block text-xs font-semibold mb-1">Name</label>
          <input
            name="custom-field-name"
            type="text"
            className="text-gray-900 border border-gray-200 text-sm rounded px-2 py-2 w-full mb-4"
            placeholder="Employee Birthdate"
            value={customField.name}
            onChange={(e) => {
              setCustomField({ ...customField, name: e.target.value });
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Type</label>
          <select
            name="custom-field-type"
            className="border border-gray-200 text-sm rounded px-2 py-2 w-full mb-4 h-[39px]"
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
        </div>
      </div>

      <label className="block text-xs font-semibold mb-1">Validations</label>

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
          className="block text-xs cursor-pointer"
        >
          Field is required
        </label>
      </div>

      {customField.type === "date" && (
        <div>
          <label className="block text-xs font-semibold mb-1">
            Date Format
          </label>
          <select
            name="custom-field-type"
            className="border border-gray-200 text-sm rounded px-2 py-2 w-1/2 mb-4"
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
          <label className="block text-xs font-semibold mb-1">
            Decimal Places
          </label>
          <input
            name="number-decimal-places"
            type="number"
            min={0}
            step={1}
            className="border border-gray-200 text-xs rounded px-2 py-2 mb-4 w-16"
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
            className="block text-xs cursor-pointer mb-2"
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

      <form className="" onSubmit={handleSubmit}>
        <input
          type="hidden"
          id="customField"
          name="customField"
          value={JSON.stringify(customField)}
        />

        <div className="flex flex-row items-center">
          <button
            onClick={() => {
              toast.success("Saved Custom Field");
            }}
            className="button-bg px-4 py-1 inline-flex items-center justify-center rounded-md text-xs font-medium shadow-sm"
          >
            Save Custom Field
          </button>

          {lastSavedAt && (
            <p className="text-[10px] text-gray-400 ml-4">
              Saved {lastSavedAt}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
