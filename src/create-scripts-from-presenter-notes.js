function createScriptsFromPresenterNotes(presenterNotes) {
  let currentVoice = "default"; // Default voice name
  let scriptData = [];
  presenterNotes.forEach((slide) => {
    console.log(`- processing slide ${slide.slide}`);

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
      note = cleanNote(note);
      const parts = note
        .split(/(\{pause \d+\})/) // First split by pauses
        .flatMap((part) => part.split(/(\{speaker ['‘][^'‘]+['’]\})/)) // Then split each part by speaker
        .filter((part) => part !== "" && !part.includes("{no pause}")); // Finally, filter the parts

      parts.forEach((part) => {
        if (part.startsWith("{pause")) {
          // Add current text to scripts and reset
          if (currentScript.trim() !== "") {
            currentSlide.scripts.push({
              text: currentScript.trim(),
              voice: currentVoice,
            });
            currentScript = "";
          }
          // Add pause to scripts
          const pauseDuration = part.match(/\d+/)[0]; // Extract duration
          currentSlide.scripts.push({ pause: parseInt(pauseDuration) });
        } else if (part.startsWith("{speaker")) {
          const speakerMatch = part.match(/\{speaker ['‘]([^'‘]+)['’]\}/);
          if (speakerMatch) {
            // Add current text to scripts and reset
            if (currentScript.trim() !== "") {
              currentSlide.scripts.push({
                text: currentScript.trim(),
                voice: currentVoice,
              });
              currentScript = "";
            }
            currentVoice = speakerMatch[1];
          }
        } else {
          currentScript += " " + part; // Accumulate text
        }
      });
    });

    // Add any remaining text as a script
    if (currentScript.trim() !== "") {
      currentSlide.scripts.push({
        text: currentScript.trim(),
        voice: currentVoice,
      });
    }

    // Apply final pause if not null and if different from initial
    if (finalPause && finalPause !== initialPause) {
      currentSlide.scripts.push(finalPause);
    }

    scriptData.push(currentSlide);
  });
  return scriptData;
}

function cleanNote(note) {
  // remove any commands and powerpoint random inserts.
  note = note.replace(/\{no pause\}/g, "");
  note = note.replace(/Text der Fußzeile/g, "");
  return note;
}

export { createScriptsFromPresenterNotes };
