import { recordHook } from "@flatfile/plugin-record-hook";
import api from "@flatfile/api";
import { xlsxExtractorPlugin } from "@flatfile/plugin-xlsx-extractor";
import { dedupePlugin } from "@flatfile/plugin-dedupe";
import { JSONExtractor } from "@flatfile/plugin-json-extractor";
import { XMLExtractor } from "@flatfile/plugin-xml-extractor";
// import { ZipExtractor } from "@flatfile/plugin-zip-extractor";
import { DelimiterExtractor } from "@flatfile/plugin-delimiter-extractor";
import { FlatfileListener, Client } from "@flatfile/listener";
import { benefitElectionsValidations } from "./validations/benefit-elections";
import { DYNAMIC_FIELD_KEY } from "../dynamic-portal-options";
import { momentFormats } from "./validations/dateFormatting";
import moment from "moment";

// Define the main function that sets up the listener
export const listener = FlatfileListener.create((client: Client) => {
  // Log the event topic for all events
  client.on("**", (event) => {
    console.log("> event.topic: ", event.topic, event);
  });

  // Attach a record hook to the 'benefit-elections-sheet' of the Flatfile importer
  client.use(
    // When a record is processed, invoke the 'jobValidations' function to check for any errors
    recordHook("benefit-elections-sheet", async (record, event) => {
      if (event) {
        const workbook = await api.workbooks.get(event.context.workbookId);

        if (!workbook?.data?.sheets) {
          console.error(
            `No workbook found for workbookId: ${event.context.workbookId}`
          );
          return;
        }

        const customFieldBlueprint = workbook.data.sheets[0].config.fields.find(
          (f) => f.key === DYNAMIC_FIELD_KEY
        );

        if (!customFieldBlueprint) {
          console.error(`No custom field found for key: ${DYNAMIC_FIELD_KEY}`);
          return;
        }

        const space = await api.spaces.get(event.context.spaceId);
        const value = record.get(customFieldBlueprint.key) as string;

        if (customFieldBlueprint.type === "number") {
          const decimalPlaces =
            space.data.metadata.customFieldValidations.decimals;

          if (value && value.trim().length > 0 && !isNaN(parseFloat(value))) {
            record.set(
              customFieldBlueprint.key,
              parseFloat(value).toFixed(decimalPlaces)
            );
            record.addComment(
              customFieldBlueprint.key,
              `Formatted to ${decimalPlaces} decimals`
            );
          }
        } else if (customFieldBlueprint.type === "date") {
          if (value.trim().length > 0) {
            const dateFormat =
              space.data.metadata.customFieldValidations.dateFormat;

            const parsedDate = moment(value, momentFormats, true);

            if (parsedDate.isValid()) {
              record.set(
                customFieldBlueprint.key,
                parsedDate.format(dateFormat)
              );
              record.addComment(
                customFieldBlueprint.key,
                `Date has been formatted as ${dateFormat}`
              );
            } else {
              record.addError(
                customFieldBlueprint.key,
                `Please check that the date is in ${dateFormat} format.`
              );
            }
          }
        }
      } else {
        console.log("NO EVENT");
      }

      const results = benefitElectionsValidations(record);
      // Log the results of the validations to the console as a JSON string
      console.log("Benefits Hooks: " + JSON.stringify(results));
      // Return the record, potentially with additional errors added by the 'benefitValidations' function
      return record;
    })
  );

  // client.use(
  //   dedupePlugin("dedupe-benefit-elections", {
  //     on: "employeeId",
  //     keep: "last",
  //   })
  // );

  // Add the XLSX extractor plugin to the listener
  // This allows the listener to parse XLSX files
  try {
    client.use(xlsxExtractorPlugin({ rawNumbers: true }));
  } catch (error) {
    console.error("Failed to parse XLSX files:", error);
  }

  // Add the JSON extractor to the listener
  // This allows the listener to parse JSON files
  try {
    client.use(JSONExtractor());
  } catch (error) {
    console.error("Failed to parse JSON files:", error);
  }

  // Add the XML extractor to the listener
  // This allows the listener to parse XML files
  try {
    client.use(XMLExtractor());
  } catch (error) {
    console.error("Failed to parse XML files:", error);
  }

  // Add the Zip extractor to the listener
  // This allows the listener to extract files from ZIP archives
  // try {
  //   client.use(ZipExtractor());
  // } catch (error) {
  //   console.error("Failed to extract files from ZIP:", error);
  // }

  // Add the delimiter extractor plugin to the listener
  // This allows the listener to parse comma-delimited TXT files
  try {
    client.use(DelimiterExtractor(".txt", { delimiter: "," }));
  } catch (error) {
    console.error("Failed to parse pipe-delimited TXT files:", error);
  }
});
