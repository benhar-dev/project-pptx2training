const { readFileContent } = require("./src/fileReader");
const { extractNotesXmlFromPptxFile } = require("./src/pptxFileHandler");
const { parseXML } = require("./src/xmlParser");
const { extractNotes } = require("./src/notesExtractor");

async function extractPresenterNotes(filePath) {
  try {
    const pptxFile = await readFileContent(filePath);
    const notesXml = await extractNotesXmlFromPptxFile(pptxFile);
    const parsedSlides = await parseXML(
      notesXml.map((slide) => ({ content: slide.content }))
    );
    const notes = extractNotes(
      parsedSlides.map((slide) => ({
        parsedContent: slide.parsedContent,
        name: slide.name,
      }))
    );
    // Assuming you want to do something with the notes here
    return notes;
  } catch (error) {
    console.error("Error in extracting presenter notes:", error);
  }
}

// Replace 'test.pptx' with the path to your .pptx file
extractPresenterNotes("test.pptx")
  .then((result) => console.log(result))
  .catch(console.error);
