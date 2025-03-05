import ffmpeg from "./ffmpeg-patched.js";
import _ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import os from "os";

function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    _ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const duration = metadata.format.duration;
        resolve(duration);
      }
    });
  });
}

function generateTempSilentAudio(duration) {
  const audioFilePath = path.join(
    os.tmpdir(),
    `silentAudio_${Math.random().toString(36).substring(2, 15)}.mp3`
  );
  return generateSilentAudio(duration, audioFilePath);
}

function generateSilentAudio(duration, outputFile) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input("anullsrc")
      .audioChannels(2)
      .audioFrequency(44100)
      .inputFormat("lavfi")
      .duration(duration)
      .output(outputFile)
      .on("end", () => {
        resolve({
          path: outputFile,
          delete: function () {
            fs.unlink(outputFile, (err) => {
              if (err) throw err;
              console.log("File successfully deleted");
            });
          },
        });
      })
      .on("error", (err) => {
        reject(err);
      })
      .run();
  });
}

export { getAudioDuration, generateTempSilentAudio, generateSilentAudio };
