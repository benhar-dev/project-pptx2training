import { createTempFilePath } from "./file-utils.js";
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error(
    "OPENAI_API_KEY is missing. Please configure your environment variables."
  );
}

const openai = new OpenAI({ apiKey });

async function generateSpeech(text) {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "fable",
    input: text,
  });

  const audioFilePath = createTempFilePath(`slide_audio`, "mp3");
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(audioFilePath, buffer);

  return audioFilePath;
}

export { generateSpeech };
