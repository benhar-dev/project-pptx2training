import fs from "fs";
import JSZip from "jszip";
import xml2js from "xml2js";

async function extractPowerpointPresenterNotes(presentationPath) {
  try {
    const pptxFile = await fs.promises.readFile(presentationPath);
    const notesXml = await extractNotesXmlFromPptxFile(pptxFile);
    const sortedNotesXml = notesXml.sort(
      (a, b) => extractSlideNumber(a.name) - extractSlideNumber(b.name)
    );
    const parsedSlides = await parseXML(
      sortedNotesXml.map((slide) => ({ content: slide.content }))
    );

    const notes = extractNotes(
      parsedSlides.map((slide) => ({
        parsedContent: slide.parsedContent,
        name: slide.name,
      }))
    );
    return notes;
  } catch (error) {
    console.error("Error in extracting presenter notes:", error);
  }
}

function extractSlideNumber(filename) {
  const match = filename.match(/notesSlide(\d+)\.xml$/);
  return match ? parseInt(match[1], 10) : 0;
}

function extractNotes(parsedSlides) {
  return parsedSlides.map((slide, index) => {
    const notes = processSlide(slide.parsedContent);
    return {
      slide: index + 1, // Slide index starts from 1
      notes: notes || [], // Ensure notes is an array, even if empty
    };
  });
}

function processSlide(slideContent) {
  if (
    slideContent["p:notes"] &&
    slideContent["p:notes"]["p:cSld"] &&
    slideContent["p:notes"]["p:cSld"][0]["p:spTree"]
  ) {
    const notesShapes =
      slideContent["p:notes"]["p:cSld"][0]["p:spTree"][0]["p:sp"];
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

    return notesTexts.length > 0 ? notesTexts : null;
  }
  return null;
}

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

async function parseXML(contents) {
  const parser = new xml2js.Parser();
  const parsedContents = [];
  for (let content of contents) {
    const parsedContent = await parser.parseStringPromise(content.content);
    parsedContents.push({ ...content, parsedContent });
  }
  return parsedContents;
}

export { extractPowerpointPresenterNotes };
