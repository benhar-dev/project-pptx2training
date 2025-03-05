import fs from "fs";
import path from "path";
import os from "os";
import OpenAI from "openai";
import dotenv from "dotenv";
import { generateTempSilentAudio } from "./ffmpeg-utils.js";

dotenv.config();

const DELAYS = {
  SLIDE_START_DELAY: 1,
  SLIDE_END_DELAY: 1,
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function getDuration(value) {
  if (typeof value === "number") {
    return value;
  } else if (typeof value === "string" && DELAYS[value]) {
    return DELAYS[value];
  }
  return 0;
}

async function generateAudio(slide) {
  const { scripts } = slide;
  const audioData = [];

  for (const script of scripts) {
    if (script.text) {
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: script.text,
      });

      const audioFilePath = path.join(
        os.tmpdir(),
        `slide_${slide.slide}_${Math.random()
          .toString(36)
          .substring(2, 15)}.mp3`
      );

      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.promises.writeFile(audioFilePath, buffer);
      audioData.push({ filepath: audioFilePath });
    } else if (script.pause) {
      const duration = getDuration(script.pause);
      const silentAudio = await generateTempSilentAudio(duration);
      audioData.push({ filepath: silentAudio.path });
    }
  }

  return audioData;
}

async function generateAudioFromScripts(slideScripts) {
  const result = [];

  for (const slide of slideScripts) {
    const audioData = await generateAudio(slide);
    result.push({ slide: slide.slide, audioData });
  }

  return result;
}

function cleanUpAudioFromScripts(data) {
  if (!data) {
    return;
  }

  if (Array.isArray(data)) {
    const audioFilePaths = [];

    data.forEach((item) => {
      if (Array.isArray(item.audioData)) {
        item.audioData.forEach((audio) => {
          if (audio.filepath) {
            audioFilePaths.push(audio.filepath);
          }
        });
      }
    });

    audioFilePaths.forEach((filePath) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file ${filePath}: ${err}`);
        } else {
          console.log(`Successfully deleted ${filePath}`);
        }
      });
    });
  }
}

export { generateAudioFromScripts, cleanUpAudioFromScripts };
