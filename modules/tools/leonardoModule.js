import fs from "fs";
import leonardoai from "@api/leonardoai";
import {
  leonardoApiKey,
  leonardoModelId,
  leonardoPresetStyle,
  isShortVideo,
} from "../../configuration.js";
import { saveFileFromUrl } from "../base/inputOutputModule.js";

leonardoai.auth(leonardoApiKey);

async function _readNegativePrompt() {
  return new Promise(async (resolve, _reject) => {
    const filePath = "leonardoNegativePrompt.txt";

    try {
      const data = await fs.promises
        .readFile(filePath, { encoding: "utf-8" })
        .catch((err) => {
          throw err;
        });

      console.info("Leonardo: Negative prompt readed from file");
      resolve(data);
    } catch (err) {
      console.error("Leonardo: Error reading negative prompt from file");
      throw err;
    }
  });
}

async function _generateImageAndGetId(prompt) {
  return new Promise(async (resolve, _reject) => {
    try {
      const negativePrompt = _readNegativePrompt();
      const { data } = await leonardoai.createGeneration({
        alchemy: false,
        height: isShortVideo ? 1280 : 720,
        modelId: leonardoModelId,
        num_images: 1,
        presetStyle: leonardoPresetStyle,
        prompt: prompt,
        width: isShortVideo ? 720 : 1280,
        public: false,
        negative_prompt: negativePrompt,
      });

      console.info(
        `Leonardo: Image Generation Id:${data.sdGenerationJob.generationId}`
      );

      resolve(data.sdGenerationJob.generationId);
    } catch (err) {
      console.error("Leonardo: Error generating image and getting id");
      throw err;
    }
  });
}

async function _checkGenerationStatus(generationId) {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await leonardoai.getGenerationById({ id: generationId });
      const generatedFiles = data.generations_by_pk.generated_images;

      if (generatedFiles.length === 0) return { status: false, url: null };

      resolve({
        status: true,
        url: generatedFiles[0].url,
      });
    } catch (error) {
      console.error("Leonardo: Error checking generation status:", error);
      reject({
        status: false,
        url: null,
      });
    }
  });
}

export async function generateImageAndSave(prompt, projectFolder) {
  return new Promise(async (resolve, _reject) => {
    try {
      const generationId = await _generateImageAndGetId(prompt);

      let { status, url } = { status: false, url: null };

      while (!status) {
        console.info(
          "Leonardo: image file not generated yet. Checking again in 10 seconds."
        );

        await new Promise((resolve) => setTimeout(resolve, 10000));

        ({ status, url } = await _checkGenerationStatus(generationId));
      }

      await saveFileFromUrl(url, "generated_image.jpg", projectFolder);
      console.info("Leonardo: Image file saved successfully.");

      resolve();
    } catch (err) {
      console.error("Leonardo: Error generating image and saving it");
      throw err;
    }
  });
}
