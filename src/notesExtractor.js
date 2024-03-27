function extractNotes(parsedSlides) {
  const notes = parsedSlides.map((slide, i) => {
    return processSlide(slide.parsedContent);
  });
  return notes.filter((note) => note); // Filter out undefined notes
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

    return notesTexts;
  }
  return null;
}

module.exports = { extractNotes };
