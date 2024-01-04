// Importing necessary modules and objects
import moment from "moment";
import { blueprint as benefitsBlueprintSheets } from "../blueprints/benefitsBlueprint";
import { FlatfileRecord } from "@flatfile/hooks";

export const momentFormats = [
  "YYYY-MM-DD", // Format: 4-digit year - 2-digit month - 2-digit day
  "MM/DD/YYYY", // Format: 2-digit month / 2-digit day / 4-digit year
  "M/D/YYYY", // Format: 1 or 2-digit month / 1 or 2-digit day / 4-digit year
  "YYYY/M/D", // Format: 4-digit year / 1 or 2-digit month / 1 or 2-digit day
  "D/M/YYYY", // Format: 1 or 2-digit day / 1 or 2-digit month / 4-digit year
  "YYYY/M/DD", // Format: 4-digit year / 1 or 2-digit month / 2-digit day
  "MM/DD/YY", // Format: 2-digit month / 2-digit day / 2-digit year
  "M/D/YY", // Format: 1 or 2-digit month / 1 or 2-digit day / 2-digit year
  "M/DD/YYYY", // Format: 1 or 2-digit month / 2-digit day / 4-digit year
  "M/DD/YY", // Format: 1 or 2-digit month / 2-digit day / 2-digit year
  "MM/D/YYYY", // Format: 2-digit month / 1 or 2-digit day / 4-digit year
  "MM/D/YY", // Format: 2-digit month / 1 or 2-digit day / 2-digit year
  "DD/MM/YYYY", // Format: 2-digit day / 2-digit month / 4-digit year
  "D/MM/YYYY", // Format: 1 or 2-digit day / 2-digit month / 4-digit year
  "DD/M/YYYY", // Format: 2-digit day / 1 or 2-digit month / 4-digit year
  "D/M/YYYY", // Format: 1 or 2-digit day / 1 or 2-digit month / 4-digit year
  "YYYY-MM-D", // Format: 4-digit year - 2-digit month - 1-digit day
  "YYYY-M-DD", // Format: 4-digit year - 1 or 2-digit month - 2-digit day
  "YY-MM-DD", // Format: 2-digit year - 2-digit month - 2-digit day
  "DD-M-YYYY", // Format: 2-digit day - 1-digit month - 4-digit year
  "D-M-YYYY", // Format: 1 or 2-digit day - 1-digit month - 4-digit year
  "DD-MM-YY", // Format: 2-digit day - 2-digit month - 2-digit year
  "D-MM-YY", // Format: 1 or 2-digit day - 2-digit month - 2-digit year
  "DD/M/YY", // Format: 2-digit day / 1 or 2-digit month / 2-digit year
  "D/M/YY", // Format: 1 or 2-digit day / 1 or 2-digit month / 2-digit year
  "DD/MM/YY", // Format: 2-digit day / 2-digit month / 2-digit year
  "D/MM/YY", // Format: 1 or 2-digit day / 2-digit month / 2-digit year
  "MM/DD", // Format: 2-digit month / 2-digit day
  "M/DD", // Format: 1 or 2-digit month / 2-digit day
  "MM/D", // Format: 2-digit month / 1 or 2-digit day
  "M/D", // Format: 1 or 2-digit month / 1 or 2-digit day
  "DD/MM", // Format: 2-digit day / 2-digit month
  "D/MM", // Format: 1 or 2-digit day / 2-digit month
  "MM-DD", // Format: 2-digit month - 2-digit day
  "M-DD", // Format: 1 or 2-digit month - 2-digit day
  "DD-M", // Format: 2-digit day - 1-digit month
  "D-M", // Format: 1 or 2-digit day - 1-digit month
  "MMddyyyy", // Format: 2-digit month - 2-digit day - 4-digit year
  "ddMMyyyy", // Format: 2-digit day - 2-digit month - 4-digit year
  "MMddyy", // Format: 2-digit month - 2-digit day - 2-digit year
  "MMDDYYYY", // Format: 2-digit month - 2-digit day - 4-digit year
  "YYYY-MM-DDTHH:mm:ss.SSSZ", // Format: 4-digit year - 2-digit month - 2-digit day - T - 2-digit hour - : - 2-digit minute - : - 2-digit second - . - 3-digit millisecond - Z
  "MMMM D YYYY", // Format: Full month name - 1 or 2-digit day - 4-digit year e.g., 'August 26 2023'
  "MMM D YYYY", // Format: Abbreviated month name - 1 or 2-digit day - 4-digit year e.g., 'Aug 26 2023'
  "D MMMM YYYY", // Format: 1 or 2-digit day - Full month name - 4-digit year e.g., '26 August 2023'
  "D MMM YYYY", // Format: 1 or 2-digit day - Abbreviated month name - 4-digit year e.g., '26 Aug 2023'
  "YYYY MMMM D", // Format: 4-digit year - Full month name - 1 or 2-digit day e.g., '2023 August 26'
  "YYYY MMM D", // Format: 4-digit year - Abbreviated month name - 1 or 2-digit day e.g., '2023 Aug 26'
];

// Combine all the blueprints into one array
const allBlueprintSheets = [...benefitsBlueprintSheets];

// A helper function to format the given date string
function formatDate(dateString: string) {
  // Check if the date string is already in 'yyyy-MM-dd' format
  if (
    dateString.length === 10 &&
    moment(dateString, "YYYY-MM-DD", true).isValid()
  ) {
    return dateString;
  }

  // Check if the date string is in 'MMDDYYYY' format
  if (
    dateString.length === 8 &&
    moment(dateString, "MMDDYYYY", true).isValid()
  ) {
    // Format the date string as 'yyyy-MM-dd'
    return moment(dateString, "MMDDYYYY").format("YYYY-MM-DD");
  }

  // Iterate through all possible date formats and try to parse the date string
  for (const format of momentFormats) {
    const momentDate = moment(dateString, format, true);
    if (momentDate.isValid()) {
      // If the date string is successfully parsed, format it as 'yyyy-MM-dd'
      return momentDate.format("YYYY-MM-DD");
    }
  }

  // If none of the above cases match, return 'Invalid Date'
  return "Invalid Date";
}

// A function to format all date fields of a record
function formatRecordDates(record: FlatfileRecord, sheetSlug: string) {
  // Find the sheet with the given slug from the blueprint sheets
  const sheet = allBlueprintSheets.find((sheet) => sheet.slug === sheetSlug);

  if (!sheet) {
    throw new Error(`Sheet with slug ${sheetSlug} not found in blueprints`);
  }

  // Get an array of keys for all fields with type 'date'
  const dateFields = sheet.fields
    .filter((field) => field.type === "date")
    .map((field) => field.key);

  // Loop through all date fields of the record
  dateFields.forEach((dateField) => {
    // Get the current value of the date field
    const inputDate = record.get(dateField);

    // Check if the current value is a non-empty string
    if (typeof inputDate === "string" && inputDate.trim().length > 0) {
      // Format the date string using the helper function formatDate
      const formattedDate = formatDate(inputDate.trim());

      // If the formatted date is invalid, add an error to the record
      if (formattedDate === "Invalid Date") {
        console.log("Invalid Date");
        record.addError(
          dateField,
          "Please check that the date is in yyyy-MM-dd format."
        );
      }
      // If the formatted date is different from the original value, update the record
      else if (formattedDate !== inputDate.trim()) {
        console.log(formattedDate);
        record.set(dateField, formattedDate);
        record.addComment(dateField, "Date has been formatted as yyyy-MM-dd");
      }
    } else if (typeof inputDate === "string" && !inputDate.trim().length) {
      // Skip validation if the current value is an empty string
      return;
    }
  });
}

// Export the formatRecordDates function for use in other modules
export { formatRecordDates };
