import fs from "fs";
import { exec } from "child_process";
import ffmpeg from "fluent-ffmpeg";
import {
  ffmpegPath,
  isShortVideo,
  enableHardwareAcceleration,
} from "../../configuration.js";
import { joinPath } from "../../utilities.js";

ffmpeg.setFfmpegPath(ffmpegPath);

export async function exportLoopVideo(projectFolder) {
  return new Promise((resolve, _reject) => {
    const videoPath = joinPath(projectFolder, "generated_motion.mp4");
    const audioPath = joinPath(projectFolder, "generated_audio.mp3");
    const outputPath = joinPath(
      projectFolder,
      isShortVideo ? "final_short_video.mp4" : "final_video.mp4"
    );

    // Build encoder options based on hardware acceleration
    const encoderOptions = enableHardwareAcceleration
      ? "-c:v h264_nvenc -preset p7 -profile:v high -rc:v vbr -b:v 5M -maxrate:v 10M -bufsize:v 10M"
      : "-c:v libx264 -preset medium -tune stillimage";

    console.info("Generating final motion video with raw command...");

    const command = `ffmpeg -i ${videoPath} -i ${audioPath} ${encoderOptions} -filter_complex "[0:v]reverse[vr];[0:v][vr]concat[v];[v]setpts=1.75*PTS[v]" -map "[v]" -map "1:a:0" -shortest ${outputPath}`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`);
        throw err;
      } else {
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        console.info("Final Motion Video created successfully");
        resolve();
      }
    });
  });
}

export async function exportImageVideo(projectFolder) {
  return new Promise((resolve, _reject) => {
    const imagePath = joinPath(projectFolder, "generated_image.jpg");
    const audioPath = joinPath(projectFolder, "generated_audio.mp3");
    const outputPath = joinPath(
      projectFolder,
      isShortVideo ? "final_short_video.mp4" : "final_video.mp4"
    );

    // Build encoder options based on hardware acceleration
    const encoderOptions = enableHardwareAcceleration
      ? "-c:v h264_nvenc -preset p7 -profile:v high -rc:v vbr -b:v 5M -maxrate:v 10M -bufsize:v 10M"
      : "-c:v libx264 -preset medium -tune stillimage";

    console.info("Generating final video with raw command...");

    const command = `ffmpeg -y -loop 1 -i "${imagePath}" -i "${audioPath}" ${encoderOptions} -c:a aac -b:a 192k -ac 2 -vf "scale='iw-mod(iw,2)':'ih-mod(ih,2)',format=yuv420p" -shortest -movflags +faststart "${outputPath}"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`);
        throw err;
      } else {
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        console.info("Final Video created successfully");
        resolve();
      }
    });
  });
}

export async function addSubtitleAndExportVideo(projectFolder) {
  return new Promise((resolve, _reject) => {
    const videoPath = joinPath(
      projectFolder,
      isShortVideo ? "final_short_video.mp4" : "final_video.mp4"
    );
    const subtitlePath = joinPath(projectFolder, "transcription.srt");
    const outputPath = joinPath(
      projectFolder,
      isShortVideo
        ? "final_short_video_with_subtitles.mp4"
        : "final_video_with_subtitles.mp4"
    );

    // Build encoder options based on hardware acceleration
    const encoderOptions = enableHardwareAcceleration
      ? "-c:v h264_nvenc -preset p7 -profile:v high -rc:v vbr -b:v 5M -maxrate:v 10M -bufsize:v 10M"
      : "-c:v libx264 -preset medium -tune stillimage";

    console.info("Adding subtitles with raw command...");

    // Escape paths for Windows
    const escapedSubtitlePath = subtitlePath.replace(/\\/g, "/");

    const command = `ffmpeg -y -i "${videoPath}" ${encoderOptions} -vf "subtitles='${escapedSubtitlePath}':force_style='FontName=Arial,FontSize=22,PrimaryColour=&Hffffff,OutlineColour=&H000000,Outline=1,Shadow=1,Bold=0,Italic=0,Underline=0,Alignment=10'" -c:a copy "${outputPath}"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error(`FFmpeg error: ${err}`);
        throw err;
      }
      if (stderr) {
        console.log(`FFmpeg output: ${stderr}`);
      }
      console.info("Subtitles added successfully");
      resolve();
    });
  });
}

export async function combineAudioChunks(projectFolder) {
  return new Promise(async (resolve, _reject) => {
    const audioFiles = await fs.promises.readdir(projectFolder);
    const audioChunks = audioFiles.filter(
      (file) => file.startsWith("chunk_") && file.endsWith(".mp3")
    );
    const outputPath = joinPath(projectFolder, "generated_audio.mp3");

    console.info("Combining audio chunks with raw command...");

    let command = 'ffmpeg -y -i "concat:';
    audioChunks.forEach((chunk) => {
      command += joinPath(projectFolder, chunk) + "|";
    });
    command = command.slice(0, -1); // remove the last pipe
    command += `" -c copy ${outputPath}`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error(`FFmpeg error: ${err}`);
        throw err;
      }
      if (stderr) {
        console.log(`FFmpeg output: ${stderr}`);
      }
      console.info("Audio chunks combined successfully");
      resolve();
    });
  });
}
