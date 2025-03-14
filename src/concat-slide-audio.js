import ffmpeg from "./ffmpeg-patched.js";
import path from "path";
import os from "os";
import fs from "fs";

function concatenateSlideAudio(files, outputFile) {
  return new Promise((resolve, reject) => {
    if (!files.length) {
      reject(new Error("No files provided for concatenation"));
      return;
    }

    const command = ffmpeg();
    files.forEach((file) => command.input(file));
    command
      .complexFilter([
        {
          filter: "concat",
          options: {
            n: files.length,
            v: 0,
            a: 1,
          },
        },
      ])
      .output(outputFile)
      .on("end", () => resolve(outputFile))
      .on("error", (error) => {
        console.error("FFmpeg processing error:", error);
        reject(new Error(`Failed to concatenate files: ${error.message}`));
      })
      .run();
  });
}

async function createSlideAudio(slides) {
  const results = [];

  for (const slide of slides) {
    const audioFilePath = path.join(
      os.tmpdir(),
      `audio_${slide.slide}_${Math.random().toString(36).substring(2, 15)}.mp3`
    );

    const filesToConcat = slide.audioData.map((audio) => audio.filepath);
    if (!filesToConcat.length) continue;

    console.log(`- processing slide ${slide.slide}`);

    try {
      const outputFile = await concatenateSlideAudio(
        filesToConcat,
        audioFilePath
      );
      results.push({ slide: slide.slide, filepath: outputFile });
    } catch (error) {
      console.error(
        "Error in concatenating audio files for slide",
        slide.slide,
        ":",
        error
      );
      continue;
    }
  }

  return results;
}

function cleanUpAudioFromSlides(data, log) {
  if (!data) return;

  data.forEach((item) => {
    fs.unlink(item.filepath, (err) => {
      if (err) {
        log(`Failed to delete file: ${item.filepath}`, err);
      } else {
        log(`Successfully deleted file: ${item.filepath}`);
      }
    });
  });
}

export { createSlideAudio, cleanUpAudioFromSlides };
