import ffmpeg from "./ffmpeg-patched.js";
import { createTempFilePath } from "./file-utils.js";
import fs from "fs";

function concatenateVideos(videoFiles, outputFile) {
  return new Promise((resolve, reject) => {
    const fileList = createTempFilePath(`filelist_`, "txt");

    const fileContent = videoFiles
      .map((file) => `file '${file.filepath}'`)
      .join("\n");

    fs.writeFileSync(fileList, fileContent);

    const filterSpec =
      videoFiles.map((_, index) => `[${index}:v][${index}:a]`).join("") +
      `concat=n=${videoFiles.length}:v=1:a=1[v][a]`;

    ffmpeg()
      .input(fileList)
      .complexFilter(filterSpec, ["v", "a"])
      .inputOptions(["-f concat", "-safe 0"]) // '-safe 0' is not required if all files are in the same directory
      .outputOptions("-c copy") // Uses the same codecs
      .output(outputFile)
      .on("error", function (error) {
        console.error("FFmpeg processing error:", error);
        reject(new Error(`Failed to concatenate files: ${error.message}`));
      })
      .on("end", function () {
        resolve(outputFile);
      })
      .run();
  });
}

// function concatenateVideos(videoFiles, outputFile) {
//   return new Promise((resolve, reject) => {
//     const command = ffmpeg();

//     // Add each video file as an input
//     videoFiles.forEach((file) => {
//       command.input(file.filepath);
//     });

//     const filterSpec =
//       videoFiles.map((_, index) => `[${index}:v][${index}:a]`).join("") +
//       `concat=n=${videoFiles.length}:v=1:a=1[v][a]`;

//     // Set output options and codecs - you may choose to re-encode here if necessary
//     command
//       .complexFilter(filterSpec, ["v", "a"])
//       .output(outputFile)
//       .on("error", function (error) {
//         console.log("Error: " + error.message);
//         reject(new Error(`Failed to concatenate files: ${error.message}`));
//       })
//       .on("end", function () {
//         console.log("Concatenation finished.");
//         resolve(outputFile);
//       })
//       .mergeToFile(outputFile, "./temp"); // Uses a temporary folder for intermediate files
//   });
// }

export { concatenateVideos };
