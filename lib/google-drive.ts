import fs from "fs";
import tmp from "tmp-promise";

const { google } = require("googleapis");

export const fetchFileFromDrive = async (): Promise<fs.ReadStream> => {
  const service = google.drive({
    version: "v3",
    auth: process.env.GOOGLE_DRIVE_API_KEY,
  });

  let file;

  try {
    const response = await service.files.get({
      fileId: process.env.GOOGLE_DRIVE_FILE_ID,
      alt: "media",
    });

    // Create a temporary file and write the data into it
    const tmpFile = await tmp.file({
      prefix: "benefits-sample-data-",
      postfix: ".csv",
    });
    fs.writeFileSync(tmpFile.path, response.data);

    // Create a fs.ReadStream from the temporary file
    file = fs.createReadStream(tmpFile.path);

    // When you're done with the file, close and unlink it
    file.on("close", () => {
      tmpFile.cleanup();
    });

    return file;
  } catch (err) {
    console.log(
      "/api/flatfile/filefeed/post-file error fetching file from Google Drive: ",
      err
    );
    throw err;
  }
};
