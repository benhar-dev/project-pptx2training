import { createTempFilePath } from "./file-utils.js";
import { ElevenLabsClient } from "elevenlabs";
import { createWriteStream } from "fs";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  throw new Error(
    "ELEVENLABS_API_KEY is missing. Please configure your environment variables."
  );
}

const voiceConfig = {
  default: "rWQ65dkQg5CwoiJG8WBz", //medium = 7YPv8kzNqlLVxfogcmfc //quick = rWQ65dkQg5CwoiJG8WBz //second = a03QNgttMY9W9NB7ihBB
  motion: "cgSgspJ2msm6clMCkdW9",
  automation: "rWQ65dkQg5CwoiJG8WBz",
  ipc: "IKne3meq5aSn9XLyUdCD",
  io: "XrExE9yKIg1WjnnlVkGX",
};

function getPlatformVoice(role) {
  return voiceConfig[role] || voiceConfig.default;
}

const client = new ElevenLabsClient({
  apiKey: apiKey,
});

async function generateSpeech(text, voice) {
  {
    return new Promise(async (resolve, reject) => {
      try {
        const platformVoice = getPlatformVoice(voice);
        const audio = await client.textToSpeech.convert(platformVoice, {
          text,
          model_id: "eleven_multilingual_v2",
          output_format: "mp3_44100_128",
        });

        const audioFilePath = createTempFilePath(`slide_audio`, "mp3");
        const fileStream = createWriteStream(audioFilePath);

        audio.pipe(fileStream);
        fileStream.on("finish", () => resolve(audioFilePath));
        fileStream.on("error", reject);
      } catch (error) {
        reject(error);
      }
    });
  }
}

export { generateSpeech };
