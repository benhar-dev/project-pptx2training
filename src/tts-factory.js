import dotenv from "dotenv";
dotenv.config();

const api = process.env.USE_API;

async function ttsFactory() {
  switch (api) {
    case "googletts":
      const { generateSpeech: generateSpeechGoogle } = await import(
        "./google-ai-tts.js"
      );
      return generateSpeechGoogle;
    case "openai":
      const { generateSpeech: generateSpeechOpenAI } = await import(
        "./open-ai-tts.js"
      );
      return generateSpeechOpenAI;
    default:
      throw new Error("Unsupported TTS API");
  }
}

export default ttsFactory;
