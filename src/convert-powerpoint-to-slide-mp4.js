import fs from "fs";
import { exec } from "child_process";
import path from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const psScriptPath = path.join(__dirname, "ps", "ExportSlides.ps1");

async function convertPowerpointToSlideMp4(presentationPath) {
  const command = `powershell.exe -ExecutionPolicy Bypass -File "${psScriptPath}" -PresentationPath "${presentationPath}"`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`PowerShell errors: ${stderr}`);
        reject(new Error(stderr));
        return;
      }
      try {
        let jsonOutput = JSON.parse(stdout);
        if (jsonOutput.success) {
          resolve(jsonOutput.success);
        } else {
          reject(new Error("No success response in JSON"));
        }
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

function cleanUpSlideMp4(data, log) {
  if (!data) {
    return;
  }

  if (Array.isArray(data)) {
    data.forEach((item) => {
      fs.unlink(item.filepath, (err) => {
        if (err) {
          log(`Failed to delete file: ${item.filepath}`, err);
        } else {
          log(`Successfully deleted file: ${item.filepath}`);
        }
      });
    });
  }
}

export { convertPowerpointToSlideMp4, cleanUpSlideMp4 };
