import fs from "fs";
import { generateTempSilentAudio } from "./ffmpeg-utils.js";
import ttsFactory from "./tts-factory.js";

const DELAYS = {
  SLIDE_START_DELAY: 0.4,
  SLIDE_END_DELAY: 1,
};

function getDuration(value) {
  if (typeof value === "number") {
    return value;
  } else if (typeof value === "string" && DELAYS[value]) {
    return DELAYS[value];
  }
  return 0;
}

async function generateAudio(slide, generateSpeech) {
  const { scripts } = slide;
  const audioData = [];

  for (const script of scripts) {
    let audioFilePath;

    if (script.text) {
      audioFilePath = await generateSpeech(script.text);
    } else if (script.pause) {
      const duration = getDuration(script.pause);
      const silentAudioFile = await generateTempSilentAudio(duration);
      audioFilePath = silentAudioFile.path;
    }

    if (audioFilePath) {
      audioData.push({ filepath: audioFilePath });
    }
  }

  return audioData;
}

async function generateAudioFromScripts(slideScripts) {
  const generateSpeech = await ttsFactory();
  const result = [];

  for (const slide of slideScripts) {
    console.log(`- processing slide ${slide.slide}`);
    const audioData = await generateAudio(slide, generateSpeech);
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
