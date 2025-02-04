import cron from "node-cron";
import {
  audioGenerator,
  isAutoCaptionEnabled,
  isScheduled,
  isShortVideo,
  isYouTubeAutoUploadEnabled,
  numberOfRuns,
} from "../../configuration.js";
import { createAudioFileFromText } from "../tools/elevenLabsModule.js";
import { generateImageAndSave } from "../tools/leonardoModule.js";
import {
  generateImageGenerationPrompt,
  generateTextToSpeech,
  generateTextToSpeechForChunks,
  generateVideoScript,
  generateVideoSeo,
  generateVideoTopic,
  transcribeAudioWithWhisper,
} from "../tools/openAiModule.js";
import { uploadVideo } from "../tools/youTubeModule.js";
import {
  chunkScript,
  createProjectFolder,
  saveResponseToFile,
} from "./inputOutputModule.js";
import {
  addSubtitleAndExportVideo,
  combineAudioChunks,
  exportImageVideo,
} from "./mediaModule.js";

async function _automationJob2() {
  return new Promise(async (resolve, _reject) => {
    try {
      const videoTopic = await generateVideoTopic();

      const projectFolder = await createProjectFolder(videoTopic);

      await saveResponseToFile(videoTopic, projectFolder, "videoTopic.md");

      const videoSeo = await generateVideoSeo(videoTopic, projectFolder);

      const videoScript = await generateVideoScript(
        videoTopic,
        videoSeo,
        projectFolder
      );

      const imagePrompt = await generateImageGenerationPrompt(
        videoTopic,
        videoSeo,
        projectFolder
      );

      await generateImageAndSave(imagePrompt, projectFolder);

      if (audioGenerator == "elevenLabs") {
        await createAudioFileFromText(videoScript, projectFolder);

        if (isAutoCaptionEnabled) {
          await transcribeAudioWithWhisper(projectFolder);
          await exportImageVideo(projectFolder);
          await addSubtitleAndExportVideo(projectFolder);
        } else {
          await exportImageVideo(projectFolder);
        }
      } else if (audioGenerator == "openAI") {
        if (!isShortVideo) {
          const chunks = await chunkScript(videoScript);
          await generateTextToSpeechForChunks(chunks);
          await combineAudioChunks(projectFolder);

          if (isAutoCaptionEnabled) {
            await transcribeAudioWithWhisper(projectFolder);
            await exportImageVideo(projectFolder);
            await addSubtitleAndExportVideo(projectFolder);
          } else {
            await exportImageVideo(projectFolder);
          }
        } else {
          await generateTextToSpeech(videoScript, projectFolder);

          if (isAutoCaptionEnabled) {
            await transcribeAudioWithWhisper(projectFolder);
            await exportImageVideo(projectFolder);
            await addSubtitleAndExportVideo(projectFolder);
          } else {
            await exportImageVideo(projectFolder);
          }
        }
      }

      if (isYouTubeAutoUploadEnabled) await uploadVideo(projectFolder);

      resolve();
    } catch (err) {
      throw err;
    }
  });
}

async function _automationStarter() {
  return new Promise(async (resolve, _reject) => {
    try {
      for (let i = 0; i < numberOfRuns; i++) {
        console.info(`Starting automation run ${i + 1} of ${numberOfRuns}`);
        await _automationJob2();
        console.info(`Automation run ${i + 1} completed.`);

        // if (i < numberOfRuns - 1) {
        //   await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second delay
        // }
      }
      resolve();
    } catch (err) {
      throw err;
    }
  });
}

export async function runAutomation() {
  if (isScheduled) {
    // Run automation every hour using cron
    // "0 * * * *" = at minute 0 of every hour
    cron.schedule("0 * * * *", _automationStarter);
  } else {
    await _automationStarter();
    process.exit();
  }
}
