const JSZip = require("jszip");

async function extractSlidesXMLContent(zipContent) {
  const zip = await JSZip.loadAsync(zipContent);
  const slidesPromises = [];

  zip.folder("ppt/notesSlides").forEach((relativePath, file) => {
    if (relativePath.endsWith(".xml")) {
      slidesPromises.push(
        file
          .async("string")
          .then((content) => ({ content, name: relativePath }))
      );
    }
  });

  return await Promise.all(slidesPromises);
}

module.exports = { extractSlidesXMLContent };
