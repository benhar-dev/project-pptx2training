function createScriptsFromPresenterNotes(presenterNotes) {
  let scriptData = [];
  presenterNotes.forEach((slide) => {
    let currentSlide = {};
    currentSlide.slide = slide.slide;
    currentSlide.scripts = [];

    let currentScript = "";
    slide.notes.forEach((note) => {
      // Split the note into text and potential pause
      const parts = note.split(/(\{pause \d+\})/).filter((part) => part !== "");
      parts.forEach((part) => {
        if (part.startsWith("{pause")) {
          // Add current text to scripts and reset
          if (currentScript.trim() !== "") {
            currentSlide.scripts.push({ text: currentScript.trim() });
            currentScript = "";
          }
          // Add pause to scripts
          const pauseDuration = part.match(/\d+/)[0]; // Extract duration
          currentSlide.scripts.push({ pause: parseInt(pauseDuration) });
        } else {
          currentScript += part; // Accumulate text
        }
      });
    });
    // Add any remaining text as a script
    if (currentScript.trim() !== "") {
      currentSlide.scripts.push({ text: currentScript.trim() });
    }

    scriptData.push(currentSlide);
  });
  return scriptData;
}

module.exports = { createScriptsFromPresenterNotes };
