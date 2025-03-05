import ffmpeg from "./ffmpeg-patched.js";
import path from "path";
import os from "os";

function concatenateSlideAudio(files, outputFile) {
  return new Promise((resolve, reject) => {
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
      .on("error", reject)
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
      return null;
    }
  }

  return results;
}

function cleanUpAudioFromSlides(data) {
  return;

  if (!data) {
    return;
  }

  if (Array.isArray(data)) {
    data.forEach((item) => {
      fs.unlink(item.filepath, (err) => {
        if (err) {
          console.error(`Failed to delete file: ${item.filepath}`, err);
        } else {
          console.log(`Successfully deleted file: ${item.filepath}`);
        }
      });
    });
  }
}

export { createSlideAudio, cleanUpAudioFromSlides };
