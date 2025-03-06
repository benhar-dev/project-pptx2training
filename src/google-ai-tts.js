import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { createTempFilePath } from "./file-utils.js";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const client = new TextToSpeechClient();

async function generateSpeech(text) {
  const request = {
    input: { text: text },
    voice: { languageCode: "en-GB", name: "en-GB-Chirp-HD-D" },
    audioConfig: { audioEncoding: "MP3" },
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    const audioFilePath = createTempFilePath("slide_audio", "mp3");
    await fs.promises.writeFile(audioFilePath, response.audioContent, "binary");
    return audioFilePath;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to synthesize speech.");
  }
}

export { generateSpeech };
