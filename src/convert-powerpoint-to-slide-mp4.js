const { exec } = require("child_process");
const path = require("path");
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
        resolve(jsonOutput);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

module.exports = { convertPowerpointToSlideMp4 };
