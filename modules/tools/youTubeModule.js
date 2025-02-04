import fs from "fs";
import { google } from "googleapis";
import { authenticateGoogleClient } from "./googleAuth.js";
import { defaultKeywords, isShortVideo } from "../../configuration.js";

await authenticateGoogleClient();

function _runUpload(filePath, title, description, tags) {
  return new Promise(async (resolve, _reject) => {
    try {
      const youtube = google.youtube({ version: "v3" });

      console.log("YouTube: Uploading video.");

      youtube.videos.insert(
        {
          part: "snippet,status",
          requestBody: {
            snippet: {
              title: title,
              description: description,
              tags: tags,
              categoryId: "22",
              defaultLanguage: "en",
            },
            status: {
              privacyStatus: "public",
              embeddable: true,
              selfDeclaredMadeForKids: false,
              madeForKids: false,
            },
          },
          media: {
            body: fs.createReadStream(filePath),
          },
        },
        (err, response) => {
          if (err) {
            console.error("YouTube: Error uploading video.");
            throw err;
          }
          console.info(
            `YouTube: Video uploaded. Video Id: ${response.data.id}`
          );
          resolve();
        }
      );
    } catch (err) {
      console.error("YouTube: Error uploading video.");
      throw err;
    }
  });
}

export async function uploadVideo(projectFolder) {
  return new Promise(async (resolve, _reject) => {
    try {
      const seo = JSON.parse(
        fs.readFileSync(`${projectFolder}/video_seo.json`, "utf8")
      );

      const filePath = `${projectFolder}/${
        isShortVideo ? "final_short_video" : "final_video"
      }.mp4`;

      await _runUpload(
        filePath,
        seo.title,
        seo.description,
        `${defaultKeywords},${seo.tags}`
      );

      resolve();
    } catch (err) {
      console.error("YouTube: Error uploading video.");
      throw err;
    }
  });
}
