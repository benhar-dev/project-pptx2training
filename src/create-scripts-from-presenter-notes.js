function createScriptsFromPresenterNotes(presenterNotes) {
  let scriptData = [];
  presenterNotes.forEach((slide) => {
    let currentSlide = {};
    currentSlide.slide = slide.slide;
    currentSlide.scripts = [];

    let initialPause = { pause: "SLIDE_START_DELAY" };
    let finalPause = { pause: "SLIDE_END_DELAY" };
    let notesLength = slide.notes.length;
    let currentScript = "";

    // Check for initial and final directives
    if (notesLength > 0) {
      const firstNote = slide.notes[0];
      const lastNote = slide.notes[notesLength - 1];

      if (firstNote.match(/^\s*\{no pause\}/)) {
        initialPause = null;
      } else if (firstNote.match(/^\s*\{pause \d+\}/)) {
        initialPause = null;
      }

      if (lastNote.match(/\{no pause\}\s*$/)) {
        finalPause = null;
      } else if (lastNote.match(/\{pause \d+\}\s*$/) && notesLength > 1) {
        finalPause = null;
      }
    }

    // Apply initial pause if not null
    if (initialPause) {
      currentSlide.scripts.push(initialPause);
    }

    slide.notes.forEach((note, index) => {
      note = note.replace(/\{no pause\}/g, "");

      // Split the note into text and potential pause
      const parts = note
        .split(/(\{pause \d+\})/)
        .filter((part) => part !== "" && !part.includes("{no pause}"));
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
          currentScript += " " + part; // Accumulate text
        }
      });
    });

    // Add any remaining text as a script
    if (currentScript.trim() !== "") {
      currentSlide.scripts.push({ text: currentScript.trim() });
    }

    // Apply final pause if not null and if different from initial
    if (finalPause && finalPause !== initialPause) {
      currentSlide.scripts.push(finalPause);
    }

    scriptData.push(currentSlide);
  });
  return scriptData;
}

export { createScriptsFromPresenterNotes };
