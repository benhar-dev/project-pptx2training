import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import util from "util";

const logging = false;

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

function log(object) {
  if (!logging) {
    return;
  }
  console.log(
    util.inspect(object, { showHidden: false, depth: null, colors: true })
  );
}

const presentationPath = path.join(__dirname, "test.pptx");

async function processPowerpoint(presentationPath) {
  let slideVideos = [];
  let slideScriptAudioSegments = [];
  let slideAudio = [];
  let slideCombinedFiles = [];

  try {
    // create mp4 files for each slide
    console.log("Creating MP4 files for each slide...");
    slideVideos = await convertPowerpointToSlideMp4(presentationPath);
    log("Conversion successful:");
    log(slideVideos);

    // extract presenter notes from each slide
    console.log("Extracting presenter notes from each slide...");
    const presenterNotes = await extractPowerpointPresenterNotes(
      presentationPath
    );
    log("Presenter notes extracted:");
    log(presenterNotes);

    // create scripts from presenter notes
    console.log("Creating scripts from presenter notes...");
    const slideScripts = createScriptsFromPresenterNotes(presenterNotes);
    log("Scripts created:");
    log(slideScripts);

    // generate audio from scripts
    console.log("Generating audio from scripts...");
    slideScriptAudioSegments = await generateAudioFromScripts(slideScripts);
    log("Audio files created:");
    log(slideScriptAudioSegments);

    // concatenate audio files
    console.log("Concatenating audio files...");
    const slideAudio = await createSlideAudio(slideScriptAudioSegments);
    log("Concatenated audio file created:");
    log(slideAudio);

    // combine slide audio with slide mp4
    console.log("Combining slide audio with slide mp4...");
    slideCombinedFiles = await combineSlideAudioWithVideo(
      slideAudio,
      slideVideos
    );
    log("Combining slide audio with slide mp4 complete:");
    log(slideCombinedFiles);

    // combine slide videos in to final video
    console.log("Combining slide videos in to final video");
    const videoFile = await concatenateVideos(slideCombinedFiles, "test.mp4");
    log(videoFile);

    // done
  } catch (error) {
    console.error("Error during PowerPoint processing:", error);
  } finally {
    // tidy up
    // cleanUpSlideMp4(slideVideos);
    // cleanUpAudioFromScripts(slideScriptAudioSegments);
    // cleanUpAudioFromSlides(slideAudio);
    // cleanUpSlideCombinedFiles(slideCombinedFiles);
  }
}

processPowerpoint(presentationPath);
