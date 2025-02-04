import { google } from "googleapis";
import { authenticateGoogleClient } from "./googleAuth.js";
import {
  isShortVideo,
  shortsNicheListFileId,
  videoNicheListFileId,
} from "../../configuration.js";

await authenticateGoogleClient();

export async function updateNicheListFile(content) {
  return new Promise((resolve, _reject) => {
    const currentContent = readNicheListFile();

    const newNicheList = currentContent + `${content},`;

    const media = {
      mimeType: "text/plain",
      body: newNicheList,
    };

    const drive = google.drive({ version: "v3" });

    drive.files
      .update({
        fileId: isShortVideo ? shortsNicheListFileId : videoNicheListFileId,
        media: media,
      })
      .then(() => {
        console.info("Google Drive: Niche list file updated successfully.");
        resolve();
      });
  });
}

export async function readNicheListFile() {
  return new Promise((resolve, _reject) => {
    const drive = google.drive({ version: "v3" });

    drive.files
      .get(
        {
          fileId: isShortVideo ? shortsNicheListFileId : videoNicheListFileId,
          alt: "media",
        },
        { responseType: "stream" }
      )
      .then((res) => {
        let content = "";
        res.data
          .on("error", (err) => {
            console.error("Error downloading file.");
            throw err;
          })
          .on("data", (d) => {
            content += d;
          })
          .on("end", () => {
            console.info("Google Drive: Niche list file read successfully.");
            resolve(content);
          });
      });
  });
}
