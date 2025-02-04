import fs from "fs";
import path from "path";
import axios from "axios";
import { joinPath } from "../../utilities.js";
import { prettyString } from "./textModule.js";
import { isShortVideo, chunkSize } from "../../configuration.js";

export async function createProjectFolder(projectFolder) {
  return new Promise(async (resolve, _reject) => {
    try {
      const prettyFolderName = prettyString(projectFolder);

      const folderPath = joinPath(
        "./exports",
        isShortVideo ? "shorts" : "videos",
        prettyFolderName
      );

      const folderName = path.basename(folderPath);
      const folderDir = path.dirname(folderPath);
      let newFolderPath = folderPath;
      let count = 1;

      // check if folder exists
      const folderExists = fs.existsSync(newFolderPath);

      if (!folderExists) {
        fs.promises.mkdir(newFolderPath, { recursive: true }).then(() => {
          console.info("Input/Output: Project folder created:", newFolderPath);
          resolve(newFolderPath);
        });
      } else {
        while (true) {
          try {
            await fs.promises.access(newFolderPath);
            const newFolderName = `${folderName}_${count}`;
            newFolderPath = joinPath(folderDir, newFolderName);
            count++;
          } catch {
            await fs.promises.mkdir(newFolderPath);
            break;
          }
        }
        console.info("Input/Output: Project folder created:", newFolderPath);
        resolve(newFolderPath);
      }
    } catch (err) {
      console.error("Input/Output: Error creating project folder:");
      throw err;
    }
  });
}

export async function saveFileFromUrl(fileUrl, fileName, folder) {
  return new Promise(async (resolve, _reject) => {
    try {
      const response = await axios({
        url: fileUrl,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.createWriteStream(joinPath(folder, fileName));

      response.data.pipe(writer);
      resolve();
    } catch (err) {
      console.error("Input/Output: Error saving file:", err);
      throw err;
    }
  });
}

export async function saveResponseToFile(response, projectFolder, fileName) {
  return new Promise(async (resolve, _reject) => {
    const filePath = joinPath(projectFolder, fileName);

    try {
      fs.promises.writeFile(filePath, response).then(() => {
        console.info("Input/Output: OpenAI response saved to file: ", filePath);
        resolve(filePath);
      });
    } catch (err) {
      throw err;
    }
  });
}

export async function saveGoogleOAuthCodeToFile(code) {
  return new Promise(async (resolve, _reject) => {
    const filePath = "auth/googleOAuthCode.txt";

    try {
      await fs.promises.writeFile(filePath, code);

      console.info("Input/Output: Google OAuth code saved to file: ", filePath);

      resolve(filePath);
    } catch (err) {
      throw err;
    }
  });
}

export function saveAudioStreamToFile(audioStream, outputPath) {
  return new Promise((resolve, _reject) => {
    console.log(audioStream);

    const writeStream = fs.createWriteStream(outputPath);

    audioStream.pipe(writeStream);

    writeStream.on("finish", () => {
      console.log("Input/Output: Audio file saved successfully.");
      resolve();
    });

    writeStream.on("error", (err) => {
      console.error("Input/Output: Error saving audio file:", err);
      throw err;
    });
  });
}

export async function convertVttToSrt(projectFolder) {
  return new Promise(async (resolve, _reject) => {
    try {
      const vttFilePath = joinPath(projectFolder, "transcription.vtt");
      const srtFilePath = joinPath(projectFolder, "transcription.srt");

      const data = await fs.promises.readFile(vttFilePath, "utf8");

      // Remove the WEBVTT header
      let srtContent = data.replace(/WEBVTT\s*\n\s*\n/, "");

      // Replace VTT timestamp format with SRT format
      srtContent = srtContent.replace(/(\d{2}:\d{2}:\d{2})\.(\d{3})/g, "$1,$2");

      // Add sequence numbers
      const srtLines = srtContent.split("\n\n");
      srtContent = srtLines
        .map((line, index) => `${index + 1}\n${line}`)
        .join("\n\n");

      await fs.promises.writeFile(srtFilePath, srtContent, "utf8");
      resolve();
    } catch (err) {
      console.error("Input/Output: Error converting VTT to SRT");
      throw err;
    }
  });
}

export async function waitForFile(filePath, timeout = 120000) {
  return new Promise((resolve, _reject) => {
    const startTime = Date.now();

    const checkFile = () => {
      if (fs.existsSync(filePath)) {
        resolve(true);
      }

      // Check again after 2 seconds
      setTimeout(checkFile, 2000);
    };

    checkFile();
  });
}

export async function chunkScript(script) {
  return new Promise(async (resolve, _reject) => {
    try {
      const words = script.split(" ");
      const chunks = [];
      let chunk = "";
      words.forEach((word) => {
        if (chunk.length + word.length < chunkSize) {
          chunk += word + " ";
        } else {
          chunks.push(chunk.trim());
          chunk = word + " ";
        }
      });
      chunks.push(chunk.trim());
      resolve(chunks);
    } catch (err) {
      console.error("Input/Output: Error chunking script");
      throw err;
    }
  });
}

export async function clearAuthFolder() {
  return new Promise(async (resolve, _reject) => {
    try {
      const folderPath = joinPath("./auth");
      const files = await fs.promises.readdir(folderPath);

      for (const file of files) {
        const filePath = joinPath(folderPath, file);
        await fs.promises.unlink(filePath);
      }

      resolve();
    } catch (err) {
      console.error("Error clearing auth folder:", err);
      throw err;
    }
  });
}
