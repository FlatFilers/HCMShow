const { google } = require("googleapis");

export const fetchFileFromDrive = async () => {
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

    // console.log("response", response);

    file = response.data;

    return file;
  } catch (err) {
    console.log(
      "/api/flatfile/filefeed/post-file error fetching file from Google Drive: ",
      err
    );
    throw err;
  }
};
