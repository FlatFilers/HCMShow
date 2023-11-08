export interface CustomField {
  name: string;
  type: keyof typeof FIELD_TYPES;
  required: boolean;
  dateFormat: keyof typeof DATE_FORMATS;
  decimals: number;
  enumOptions: Option[];
}

export const FIELD_TYPES = {
  string: "Text",
  number: "Number",
  date: "Date",
  enum: "Category",
  boolean: "Checkbox",
};

export const DATE_FORMATS = {
  "yyyy-mm-dd": "yyyy-mm-dd",
  "mm-dd-yyyy": "mm-dd-yyyy",
  "dd-mm-yyyy": "dd-mm-yyyy",
};

export interface Option {
  id: number;
  input: string;
  output: string;
}

export const INITIAL_OPTIONS: Option[] = [
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

export const DEFAULT_CUSTOM_FIELD: CustomField = {
  name: "Birthdate",
  type: "date",
  required: true,
  dateFormat: "yyyy-mm-dd",
  decimals: 2,
  enumOptions: INITIAL_OPTIONS,
};
