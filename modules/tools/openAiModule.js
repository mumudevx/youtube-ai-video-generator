import fs from "fs";
import OpenAI from "openai";
import {
  channelUrl,
  defaultKeywords,
  includeKeywordsIntoPrompts,
  isShortVideo,
  nicheGeneratorAssistantId,
  videoTopicAssistantId,
  videoSeoAssistantId,
  scriptWriterAssistantId,
  shortScriptWriterAssistantId,
  imageGenerationAssistantId,
} from "../../configuration.js";
import { updateNicheListFile, readNicheListFile } from "./googleDriveModule.js";
import {
  convertVttToSrt,
  saveResponseToFile,
} from "../base/inputOutputModule.js";
import { joinPath } from "../../utilities.js";

async function _sendRequestToOpenAi(instructions, assistantId) {
  return new Promise(async (resolve, _reject) => {
    try {
      console.info("OpenAI: Sending Request");

      const openai = new OpenAI();

      openai.beta.threads.create().then((thread) => {
        openai.beta.threads.messages
          .create(thread.id, {
            role: "user",
            content: instructions,
          })
          .then(() => {
            openai.beta.threads.runs
              .createAndPoll(thread.id, {
                assistant_id: assistantId,
              })
              .then((run) => {
                openai.beta.threads.messages
                  .list(run.thread_id)
                  .then((messages) => {
                    console.info("OpenAI: Request Successful");
                    resolve(messages.data[0].content[0].text.value);
                  });
              });
          });
      });
    } catch (err) {
      console.error("OpenAI: Request Error");
      throw err;
    }
  });
}

async function _generateVideoNiche() {
  return new Promise(async (resolve, _reject) => {
    try {
      console.info("OpenAI: Generating Video Niche");

      const nicheList = await readNicheListFile();

      const instructions = `YouTube Channel: ${channelUrl} Niche List: ${nicheList}`;

      const videoNiche = await _sendRequestToOpenAi(
        instructions,
        nicheGeneratorAssistantId
      );

      await updateNicheListFile(videoNiche);

      console.info("OpenAI: Video Niche Generated Successfully");
      resolve(videoNiche);
    } catch (err) {
      console.error("OpenAI: Video Niche Generation Error");
      throw err;
    }
  });
}

export async function generateVideoTopic() {
  return new Promise(async (resolve, _reject) => {
    try {
      _generateVideoNiche().then((niche) => {
        const instructions = includeKeywordsIntoPrompts
          ? `Niche: ${niche} Keywords: ${defaultKeywords}`
          : `Niche: ${niche}`;

        console.info("OpenAI: Generating Video Topic");

        _sendRequestToOpenAi(instructions, videoTopicAssistantId).then(
          (videoTopic) => {
            console.info("OpenAI: Video Topic Generated Successfully");
            resolve(videoTopic);
          }
        );
      });
    } catch (err) {
      console.error("OpenAI: Video Topic Generation Error");
      throw err;
    }
  });
}

export async function generateVideoSeo(videoTopic, projectFolder) {
  return new Promise(async (resolve, _reject) => {
    try {
      const instructions = includeKeywordsIntoPrompts
        ? `Video Topic: "${videoTopic} Keywords: ${defaultKeywords}"`
        : `Video Topic: ${videoTopic}`;

      const videoSeo = await _sendRequestToOpenAi(
        instructions,
        videoSeoAssistantId
      );

      console.info("OpenAI: Video SEO Generated Successfully");

      saveResponseToFile(videoSeo, projectFolder, "video_seo.json").then(() => {
        resolve(videoSeo);
      });
    } catch (err) {
      console.error("OpenAI: Video SEO Generation Error");
      throw err;
    }
  });
}

export async function generateVideoScript(videoTopic, videoSeo, projectFolder) {
  return new Promise(async (resolve, _reject) => {
    try {
      console.info("OpenAI: Generating Video Script");

      const instructions = `Video Topic: "${videoTopic}"\nSEO: "${videoSeo}"`;

      const scriptWriterAssistantIdToUse = isShortVideo
        ? shortScriptWriterAssistantId
        : scriptWriterAssistantId;

      const videoScript = await _sendRequestToOpenAi(
        instructions,
        scriptWriterAssistantIdToUse
      );

      console.info("OpenAI: Video Script Generated Successfully");

      saveResponseToFile(videoScript, projectFolder, "video_script.txt").then(
        () => {
          resolve(videoScript);
        }
      );
    } catch (err) {
      console.error("OpenAI: Video Script Generation Error");
      throw err;
    }
  });
}

export async function generateImageGenerationPrompt(
  videoTopic,
  videoSeo,
  projectFolder
) {
  return new Promise(async (resolve, _reject) => {
    try {
      console.info("OpenAI: Generating Image Generation Prompt");

      const instructions = `Video Topic: "${videoTopic}"\nSEO: "${videoSeo}"`;

      const imageGenerationPrompt = await _sendRequestToOpenAi(
        instructions,
        imageGenerationAssistantId
      );

      console.info("OpenAI: Image Generation Prompt Generated Successfully");

      saveResponseToFile(
        imageGenerationPrompt,
        projectFolder,
        "image_generation_prompt.md"
      ).then(() => {
        resolve(imageGenerationPrompt);
      });
    } catch (err) {
      console.error("OpenAI: Image Generation Prompt Generation Error");
      throw err;
    }
  });
}

export async function generateTextToSpeech(text, projectFolder, fileName) {
  return new Promise(async (resolve, _reject) => {
    try {
      console.info("OpenAI TTS: Generating Audio");

      const openai = new OpenAI();

      const audio = await openai.audio.speech.create({
        model: "tts-1",
        voice: "onyx",
        input: text,
      });

      const buffer = Buffer.from(await audio.arrayBuffer());
      
      await fs.promises.writeFile(
        joinPath(
          projectFolder,
          fileName ? `${fileName}.mp3` : "generated_audio.mp3"
        ),
        buffer
      );

      console.info("OpenAI TTS: Audio Generated Successfully");
      resolve();
    } catch (err) {
      console.error("OpenAI TTS: Audio Generation Error");
      throw err;
    }
  });
}

export async function generateTextToSpeechForChunks(chunks, projectFolder) {
  return new Promise(async (resolve, _reject) => {
    try {
      for (const chunk of chunks) {
        const index = chunks.indexOf(chunk);
        await generateTextToSpeech(
          chunk,
          projectFolder,
          `chunk_${index}_audio`
        );
      }

      resolve();
    } catch (err) {
      console.error("OpenAI: Chunk Audio Generation Error");
      throw err;
    }
  });
}

export async function transcribeAudioWithWhisper(projectFolder) {
  return new Promise(async (resolve, _reject) => {
    try {
      console.info("OpenAI Whisper: Transcription Started");

      const openai = new OpenAI();

      const audioStream = fs.createReadStream(
        joinPath(projectFolder, "generated_audio.mp3")
      );

      const transcription = await openai.audio.transcriptions.create({
        file: audioStream,
        model: "whisper-1",
        response_format: "vtt",
      });

      await fs.promises.writeFile(
        joinPath(projectFolder, "transcription.vtt"),
        transcription
      );

      console.info("OpenAI Whisper: Transcription Completed");

      await convertVttToSrt(projectFolder);
      resolve();
    } catch (err) {
      console.error("OpenAI: Whisper Transcription Error");
      throw err;
    }
  });
}
