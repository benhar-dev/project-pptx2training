const fs = require("fs");
const path = require("path");
const util = require("util");

const logging = true;
const enableVideoConversion = false;

const {
  convertPowerpointToSlideMp4,
} = require("./src/convert-powerpoint-to-slide-mp4");

const {
  extractPowerpointPresenterNotes,
} = require("./src/extract-powerpoint-presenter-notes");

const {
  createScriptsFromPresenterNotes,
} = require("./src/create-scripts-from-presenter-notes");

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
  let conversions = [];

  try {
    if (enableVideoConversion) {
      conversions = await convertPowerpointToSlideMp4(presentationPath);
      if (!conversions.success) {
        console.error("Conversion failed, no slides found.");
        return;
      }
      console.log("Conversion successful:");
      log(conversions.success);
    }
    const presenterNotes = await extractPowerpointPresenterNotes(
      presentationPath
    );
    log("Presenter notes extracted:");
    log(presenterNotes);

    const scripts = createScriptsFromPresenterNotes(presenterNotes);
    log("Scripts created:");
    log(scripts);
  } catch (error) {
    console.error("Error during PowerPoint processing:", error);
  } finally {
    // tidy up
    if (conversions.success) {
      cleanUpVideoFiles(converstions.success);
    }
  }
}

function cleanUpVideoFiles(data) {
  data.forEach((item) => {
    fs.unlink(item.videoPath, (err) => {
      if (err) {
        console.error(`Failed to delete file: ${item.videoPath}`, err);
      } else {
        console.log(`Successfully deleted file: ${item.videoPath}`);
      }
    });
  });
}

processPowerpoint(presentationPath);
