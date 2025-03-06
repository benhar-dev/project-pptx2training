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

    ffmpeg()
      .input(fileList)
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

export { concatenateVideos };
