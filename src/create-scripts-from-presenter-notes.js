const syntaxHandlers = [
  {
    name: "pause",
    pattern: /\{pause (\d+)\}/,
    handle(match, context) {
      context.flushCurrentScript();
      context.currentSlide.scripts.push({ pause: parseInt(match[1]) });
    },
    setupGlobalContext(globalContext) {
      //
    },
    setupSlideContext(context) {
      //
    },
  },
  {
    name: "speaker",
    pattern: /\{speaker ['‘]([^'‘]+)['’]\}/,
    handle(match, context) {
      context.flushCurrentScript();
      context.currentVoice = match[1];
      context.global.currentVoice = match[1];
    },
    setupGlobalContext(globalContext) {
      globalContext.currentVoice = "default";
    },
    setupSlideContext(context) {
      context.currentVoice = context.global.currentVoice;
    },
  },
  {
    name: "no_pause",
    pattern: /\{no pause\}/,
    handle(match, context) {
      // No direct action; handled at slide boundary, but used to remove the command from the text.
    },
    setupGlobalContext(globalContext) {
      //
    },
    setupSlideContext(context) {
      //
    },
  },
];

function createScriptsFromPresenterNotes(presenterNotes) {
  let scriptData = [];
  let globalContext = {};

  syntaxHandlers.forEach((handler) => {
    handler.setupGlobalContext(globalContext);
  });

  presenterNotes.forEach((slide) => {
    console.log(`- processing slide ${slide.slide}`);

    let context = {
      global: globalContext,
      currentVoice: "default",
      currentScript: "",
      currentSlide: { slide: slide.slide, scripts: [] },
      flushCurrentScript() {
        if (this.currentScript.trim() !== "") {
          this.currentSlide.scripts.push({
            text: this.currentScript.trim(),
            voice: this.currentVoice,
          });
          this.currentScript = "";
        }
      },
    };

    syntaxHandlers.forEach((handler) => {
      handler.setupSlideContext(context);
    });

    const initialPause = getStartBoundaryPause(slide.notes[0]);
    const finalPause = getEndBoundaryPause(slide.notes[slide.notes.length - 1]);

    if (initialPause) context.currentSlide.scripts.push(initialPause);

    slide.notes.forEach((note, index) => {
      if (index > 0) {
        context.currentScript += "\n\n";
      }
      while (note.length > 0) {
        let closestMatch = null;
        let closestIndex = Infinity;
        let closestHandler = null;

        syntaxHandlers.forEach((handler) => {
          const match = handler.pattern.exec(note);
          if (match && match.index < closestIndex) {
            closestMatch = match;
            closestIndex = match.index;
            closestHandler = handler;
          }
        });

        if (closestMatch) {
          context.currentScript += note.substring(0, closestIndex).trim();
          if (context.currentScript.length > 0) context.currentScript += " ";
          closestHandler.handle(closestMatch, context);
          note = note
            .substring(closestIndex + closestMatch[0].length)
            .trimStart();
        } else {
          context.currentScript += note.trim();
          break;
        }
      }
    });

    context.flushCurrentScript();

    if (finalPause && finalPause !== initialPause)
      context.currentSlide.scripts.push(finalPause);

    scriptData.push(context.currentSlide);

    globalContext = context.global;
  });

  return scriptData;
}

function getStartBoundaryPause(note) {
  if (/^\s*\{no pause\}/.test(note) || /^\s*\{pause \d+\}/.test(note)) {
    return null;
  }
  return { pause: "SLIDE_START_DELAY" };
}

function getEndBoundaryPause(note) {
  if (/\{no pause\}\s*$/.test(note) || /\{pause \d+\}\s*$/.test(note)) {
    return null;
  }
  return { pause: "SLIDE_END_DELAY" };
}

export { createScriptsFromPresenterNotes };
