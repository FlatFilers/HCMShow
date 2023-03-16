import { useState } from "react";

type Props = {};

const fieldTypes: { [key: string]: string } = {
  text: "Text",
  number: "Number",
  date: "Date",
  category: "Category",
  boolean: "Checkbox",
};

export const CustomFieldBuilder = ({}: Props) => {
  const [customFieldName, setCustomFieldName] = useState("");
  const [selectedFieldType, setSelectedFieldType] =
    useState<keyof typeof fieldTypes>("text");

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
        placeholder="Favorite Candy"
        onChange={(e) => setCustomFieldName(e.target.value)}
      />

      <label className="block font-semibold mb-1">Type</label>
      <select
        name="custom-field-type"
        className="border border-gray-200 rounded px-2 py-2 w-full mb-4"
        onChange={(e) => setSelectedFieldType(e.target.value)}
      >
        {Object.keys(fieldTypes).map((key) => {
          return <option value={key}>{fieldTypes[key]}</option>;
        })}
      </select>

      <label className="block font-semibold mb-1">Validations</label>

      <div className="flex flex-row items-center mb-4">
        <input
          id="custom-field-required-validation"
          name="custom-field-required-validation"
          type="checkbox"
          className="mr-2"
        />
        <label
          htmlFor="custom-field-required-validation"
          className="block text-sm cursor-pointer"
        >
          Field is required
        </label>
      </div>

      {selectedFieldType === "date" && (
        <div>
          <label className="block text-sm font-semibold mb-1">
            Date Format
          </label>
          <select
            name="custom-field-type"
            className="border border-gray-200 rounded px-2 py-2 w-1/2 mb-4"
          >
            <option value="yyyy-mm-dd">yyyy-mm-dd</option>
            <option value="mm-dd-yyyy">mm-dd-yyyy</option>
            <option value="dd-mm-yyyy">dd-mm-yyyy</option>
          </select>
        </div>
      )}

      {selectedFieldType === "number" && (
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
          />
        </div>
      )}
    </div>
  );
};
