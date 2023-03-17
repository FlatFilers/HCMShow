import {
  CustomField,
  dateFormats,
  fieldTypes,
} from "../../pages/dynamic-templates";
import { OptionBuilder } from "./option-builder";

type Props = {
  customField: CustomField;
  setCustomField: (customField: CustomField) => void;
};

export const CustomFieldBuilder = ({ customField, setCustomField }: Props) => {
  const options = customField.enumOptions;

  return (
    <div className="max-w-lg">
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
    </div>
  );
};
