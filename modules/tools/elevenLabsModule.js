import { ElevenLabsClient } from "elevenlabs";
import { elevenLabsApiKey } from "../../configuration.js";
import fs from "fs";
import { joinPath } from "../../utilities.js";

const elevenLabsClient = new ElevenLabsClient({
  apiKey: elevenLabsApiKey,
});

export async function createAudioFileFromText(text, projectFolder) {
  return new Promise(async (resolve, _reject) => {
    try {
      console.info("Generating audio file...");

      const audio = await elevenLabsClient.generate({
        voice: "Brian",
        model_id: "eleven_turbo_v2",
        text,
      });

      const fileStream = fs.createWriteStream(
        joinPath(projectFolder, "generated_audio.mp3")
      );

      audio.pipe(fileStream).addListener("finish", () => {
        console.info("Audio file saved successfully");
        resolve();
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
}
