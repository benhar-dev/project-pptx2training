const JSZip = require("jszip");

async function extractNotesXmlFromPptxFile(pptxFile) {
  const zip = await JSZip.loadAsync(pptxFile);
  const slidesPromises = [];

  zip.folder("ppt/notesSlides").forEach((relativePath, file) => {
    if (relativePath.endsWith(".xml")) {
      slidesPromises.push(
        file
          .async("string")
          .then((content) => ({ name: relativePath, content }))
      );
    }
  });

  return await Promise.all(slidesPromises);
}

module.exports = { extractNotesXmlFromPptxFile };
