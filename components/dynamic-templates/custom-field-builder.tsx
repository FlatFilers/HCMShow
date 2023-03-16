import { useState } from "react";

type Props = {
  onChange: (customField: any) => void;
};

const fieldTypes = {
  string: "Text",
  number: "Number",
  date: "Date",
  enum: "Category",
  boolean: "Checkbox",
};

const dateFormats = {
  "yyyy-mm-dd": "yyyy-mm-dd",
  "mm-dd-yyyy": "mm-dd-yyyy",
  "dd-mm-yyyy": "dd-mm-yyyy",
};

export const CustomFieldBuilder = ({ onChange }: Props) => {
  // todo: work this into one object
  const [customFieldName, setCustomFieldName] = useState("");
  const [selectedFieldType, setSelectedFieldType] =
    useState<keyof typeof fieldTypes>("date");
  const [isRequired, setIsRequired] = useState(false);
  const [selectedDateFormat, setSelectedDateFormat] =
    useState<keyof typeof dateFormats>("yyyy-mm-dd");
  const [decimalPlaces, setDecimalPlaces] = useState<number>(2);

  const formCustomField = () => {
    return {
      key: customFieldName?.replace(/\s/, ""),
      type: selectedFieldType,
      label: customFieldName,
      description: "Custom field",
      constraints: [{ type: "required" }],
    };
  };

  // console.log("customfield", customField);

  // onChange(customField);

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
        onChange={(e) => {
          setCustomFieldName(e.target.value);
          onChange(formCustomField());
        }}
      />

      <label className="block font-semibold mb-1">Type</label>
      <select
        name="custom-field-type"
        className="border border-gray-200 rounded px-2 py-2 w-full mb-4"
        value={selectedFieldType}
        onChange={(e) => {
          setSelectedFieldType(e.target.value as keyof typeof fieldTypes);
          onChange(formCustomField());
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
          checked={isRequired}
          onChange={(e) => {
            setIsRequired(e.target.checked);
            onChange(formCustomField());
          }}
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
            value={selectedDateFormat}
            onChange={(e) => {
              setSelectedDateFormat(e.target.value as keyof typeof dateFormats);
              onChange(formCustomField());
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
            defaultValue={decimalPlaces}
            onChange={(e) => {
              setDecimalPlaces(parseInt(e.target.value));
              onChange(formCustomField());
            }}
          />
        </div>
      )}
    </div>
  );
};
