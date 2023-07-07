import { DateTime } from "luxon";

export const parseDate = ({
  fieldName,
  value,
}: {
  fieldName: string;
  value: string;
}): DateTime => {
  let date = DateTime.fromFormat(value, "yyyy-MM-dd");

  if (!date.isValid) {
    date = DateTime.fromISO(value as string);
  }

  if (!date.isValid) {
    throw new Error(
      `Error: invalid date format for ${fieldName}, value: ${value}`
    );
  }

  return date;
};
