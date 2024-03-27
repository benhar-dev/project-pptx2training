const fs = require("fs");
const JSZip = require("jszip");
const xml2js = require("xml2js");

async function extractPresenterNotes(filePath) {
  const content = await fs.promises.readFile(filePath);
  const zip = await JSZip.loadAsync(content);
  const slidesPromises = [];

  // Reading each notesSlide XML file
  zip.folder("ppt/notesSlides").forEach((relativePath, file) => {
    if (relativePath.endsWith(".xml")) {
      slidesPromises.push(
        file
          .async("string")
          .then((content) => ({ content, name: relativePath }))
      );
    }
  });

  const slidesContents = await Promise.all(slidesPromises);
  const parser = new xml2js.Parser();

  // Sort slides by their filenames to ensure correct order
  slidesContents.sort((a, b) => a.name.localeCompare(b.name));

  // Process each slide in order
  for (let i = 0; i < slidesContents.length; i++) {
    try {
      const result = await parser.parseStringPromise(slidesContents[i].content);
      // Ensure that the expected structure exists
      if (
        result["p:notes"] &&
        result["p:notes"]["p:cSld"] &&
        result["p:notes"]["p:cSld"][0]["p:spTree"]
      ) {
        const notesShapes =
          result["p:notes"]["p:cSld"][0]["p:spTree"][0]["p:sp"];
        const notesTexts = [];

        for (const shape of notesShapes) {
          if (shape["p:txBody"]) {
            const paragraphs = shape["p:txBody"][0]["a:p"];
            for (const para of paragraphs) {
              const texts = para["a:r"]?.map((r) => r["a:t"][0]).join("");
              if (texts) {
                notesTexts.push(texts);
              }
            }
          }
        }

        const notes = notesTexts.join("\n");
        console.log(`Notes for slide ${i + 1}:`, notes);
      } else {
        console.log(
          `Slide ${
            i + 1
          } does not contain any notes or has an unexpected XML structure.`
        );
      }
    } catch (err) {
      console.error("Error parsing XML:", err);
    }
  }
}

// Replace 'your_presentation.pptx' with the path to your .pptx file
extractPresenterNotes("test.pptx").catch(console.error);
