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
import { theme } from "./themes/dynamic";
import { blueprint } from "./blueprints/benefitsBlueprint";
import { FlatfileApiService } from "./flatfile-api-service";

// Define the main function that sets up the listener
export const listener = FlatfileListener.create((client: Client) => {
  // Log the event topic for all events
  client.on("**", (event) => {
    console.log("> event.topic: " + event.topic);
  });

  // Add an event listener for the 'job:created' event
  client.filter({ job: "space:configure" }, (configure) => {
    configure.on("job:ready", async (event) => {
      console.log("Reached the job:ready event callback");

      // Destructure the 'context' object from the event object to get the necessary IDs
      const { spaceId, environmentId, jobId } = event.context;

      const updateJob1 = await api.jobs.ack(jobId, {
        info: "Creating Space",
        progress: 10,
      });

      console.log("Updated Job: " + JSON.stringify(updateJob1));

      // Log the environment ID to the console
      console.log("env: " + environmentId);
      console.log("spaceId " + spaceId);
      console.log("jobID: " + jobId);

      // Setup the space
      await FlatfileApiService.setupSpace({
        name: "Benefits Workbook",
        spaceId,
        environmentId,
        blueprint,
        theme,
      });

      // Update the job status to 'complete' using the Flatfile API
      const updateJob = await api.jobs.update(jobId, {
        status: "complete",
      });

      // Log the result of the updateJob function to the console as a string
      console.log(
        "Updated Job With ID to Status Complete: " + updateJob.data.id
      );
    });

    // Handle the 'job:failed' event
    configure.on("job:failed", async (event) => {
      console.log("Job Failed: " + JSON.stringify(event));
    });
  });

  // Attach a record hook to the 'benefit-elections-sheet' of the Flatfile importer
  client.use(
    // When a record is processed, invoke the 'jobValidations' function to check for any errors
    recordHook("benefit-elections-sheet", (record) => {
      const results = benefitElectionsValidations(record);
      // Log the results of the validations to the console as a JSON string
      console.log("Benefits Hooks: " + JSON.stringify(results));
      // Return the record, potentially with additional errors added by the 'benefitValidations' function
      return record;
    })
  );

  client.use(
    dedupePlugin("dedupe-benefit-elections", {
      on: "employeeId",
      keep: "last",
    })
  );

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
