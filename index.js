import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const defaultPptx = "PowerPoint2Video Tutorial.pptx";

import util from "util";

import {
  convertPowerpointToSlideMp4,
  cleanUpSlideMp4,
} from "./src/convert-powerpoint-to-slide-mp4.js";
import { extractPowerpointPresenterNotes } from "./src/extract-powerpoint-presenter-notes.js";
import { createScriptsFromPresenterNotes } from "./src/create-scripts-from-presenter-notes.js";
import {
  generateAudioFromScripts,
  cleanUpAudioFromScripts,
} from "./src/generate-audio-from-scripts.js";
import {
  createSlideAudio,
  cleanUpAudioFromSlides,
} from "./src/concat-slide-audio.js";
import { combineSlideAudioWithVideo } from "./src/combine-slide-audio-with-video.js";
import { concatenateVideos } from "./src/concat-slide-video.js";
import { customizeScripts } from "./src/customize-scripts.js";

let log = null;

async function selectPresentation() {
  const dirPath = path.join(__dirname, "dist");
  const files = await fs.readdir(dirPath);
  const pptFiles = files.filter(
    (file) =>
      !file.startsWith("~") && (file.endsWith(".ppt") || file.endsWith(".pptx"))
  );

  if (pptFiles.length === 0) {
    console.log("No PowerPoint files found in the 'dist' folder.");
    process.exit(0);
  }

  let logging = false;
  let deleteAssets = true;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    console.clear();
    console.log("Select a presentation to convert:\n");
    console.log(`[0] ${defaultPptx}`);
    pptFiles.forEach((file, index) => console.log(`[${index + 1}] ${file}`));
    console.log(`\nOptions : `);
    console.log(`\n[l] Toggle logging ${logging ? "(enabled)" : "(disabled)"}`);
    console.log(
      `[t] Toggle tidy ${
        deleteAssets ? "(auto delete assets)" : "(preserve assets)"
      }`
    );
    console.log(`[q] Quit `);

    const answer = await new Promise((resolve) => rl.question("> ", resolve));
    if (answer.toLowerCase() === "l") {
      logging = !logging;
    } else if (answer.toLowerCase() === "t") {
      deleteAssets = !deleteAssets;
    } else if (answer.toLowerCase() === "q") {
      process.exit(0);
    } else if (answer.toLowerCase() === "0") {
      rl.close();
      return {
        file: defaultPptx,
        logging,
        deleteAssets,
      };
    } else {
      const selectedIndex = parseInt(answer, 10) - 1;
      if (selectedIndex >= 0 && selectedIndex < pptFiles.length) {
        rl.close();
        return {
          file: path.join("dist", pptFiles[selectedIndex]),
          logging,
          deleteAssets,
        };
      }
      console.log("Invalid selection, please try again.");
    }
  }
}

async function processPowerpoint(
  presentationPath,
  outputPath,
  logging,
  deleteAssets
) {
  let slideVideos = [],
    slideScriptAudioSegments = [],
    slideAudio;

  log = (object) => {
    if (!logging) return;
    console.log(
      util.inspect(object, { showHidden: false, depth: null, colors: true })
    );
  };

  try {
    console.log("Creating MP4 files for each slide...");
    slideVideos = await convertPowerpointToSlideMp4(presentationPath);
    log(slideVideos);

    console.log("Extracting presenter notes from each slide...");
    const presenterNotes = await extractPowerpointPresenterNotes(
      presentationPath
    );
    log(presenterNotes);

    console.log("Creating scripts from presenter notes...");
    const slideScripts = createScriptsFromPresenterNotes(presenterNotes, log);
    log(slideScripts);

    console.log("Customizing scripts...");
    const customizedSlideScripts = await customizeScripts(slideScripts);
    log(customizedSlideScripts);

    console.log("Generating audio from scripts...");
    slideScriptAudioSegments = await generateAudioFromScripts(
      customizedSlideScripts
    );
    log(slideScriptAudioSegments);

    console.log("Concatenating audio files...");
    slideAudio = await createSlideAudio(slideScriptAudioSegments);
    log(slideAudio);

    console.log("Combining slide audio with slide mp4...");
    const slideCombinedFiles = await combineSlideAudioWithVideo(
      slideAudio,
      slideVideos
    );
    log(slideCombinedFiles);

    console.log("Combining slide videos into final video...");
    const videoFile = await concatenateVideos(slideCombinedFiles, outputPath);
    console.log("Finished");
    console.log(videoFile);
  } catch (error) {
    console.error("Error during PowerPoint processing:", error);
  } finally {
    if (!deleteAssets) return;
    cleanUpSlideMp4(slideVideos, log);
    cleanUpAudioFromScripts(slideScriptAudioSegments, log);
    cleanUpAudioFromSlides(slideAudio, log);
  }
}

(async () => {
  const {
    file: selectedFile,
    logging,
    deleteAssets,
  } = await selectPresentation();
  const input = path.join(__dirname, selectedFile);
  const outputFileName = selectedFile.replace(/\.(ppt|pptx)$/i, ".mp4");
  const output = path.join(__dirname, outputFileName);

  await processPowerpoint(input, output, logging, deleteAssets);
})();
