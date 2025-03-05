import { expect } from "chai";
import { createScriptsFromPresenterNotes } from "../src/create-scripts-from-presenter-notes.js";

describe("createScriptsFromPresenterNotes", function () {
  it("should add default pauses at the beginning and the end", function () {
    const input = [
      {
        slide: 1,
        notes: ["Hello world!", "This is a test."],
      },
      {
        slide: 2,
        notes: ["Hello world!", "This is a second test."],
      },
    ];
    const expected = [
      {
        slide: 1,
        scripts: [
          { pause: "SLIDE_START_DELAY" },
          { text: "Hello world! This is a test." },
          { pause: "SLIDE_END_DELAY" },
        ],
      },
      {
        slide: 2,
        scripts: [
          { pause: "SLIDE_START_DELAY" },
          { text: "Hello world! This is a second test." },
          { pause: "SLIDE_END_DELAY" },
        ],
      },
    ];
    const result = createScriptsFromPresenterNotes(input);
    expect(result).to.deep.equal(expected);
  });

  it("should handle {no pause} directive correctly at the beginning", function () {
    const input = [
      {
        slide: 1,
        notes: ["{no pause}", "Welcome to the presentation."],
      },
    ];
    const expected = [
      {
        slide: 1,
        scripts: [
          { text: "Welcome to the presentation." },
          { pause: "SLIDE_END_DELAY" },
        ],
      },
    ];
    const result = createScriptsFromPresenterNotes(input);
    expect(result).to.deep.equal(expected);
  });

  it("should handle {no pause} directive correctly at the beginning as part of a line", function () {
    const input = [
      {
        slide: 1,
        notes: ["{no pause} Welcome to the presentation."],
      },
    ];
    const expected = [
      {
        slide: 1,
        scripts: [
          { text: "Welcome to the presentation." },
          { pause: "SLIDE_END_DELAY" },
        ],
      },
    ];
    const result = createScriptsFromPresenterNotes(input);
    expect(result).to.deep.equal(expected);
  });

  it("should handle custom pause durations", function () {
    const input = [
      {
        slide: 1,
        notes: ["{pause 3}", "This is an introduction.", "{pause 2}"],
      },
    ];
    const expected = [
      {
        slide: 1,
        scripts: [
          { pause: 3 },
          { text: "This is an introduction." },
          { pause: 2 },
        ],
      },
    ];
    const result = createScriptsFromPresenterNotes(input);
    expect(result).to.deep.equal(expected);
  });

  it("should not add default pause at the end if {no pause} is specified", function () {
    const input = [
      {
        slide: 1,
        notes: ["First point.", "{no pause}"],
      },
    ];
    const expected = [
      {
        slide: 1,
        scripts: [{ pause: "SLIDE_START_DELAY" }, { text: "First point." }],
      },
    ];
    const result = createScriptsFromPresenterNotes(input);
    expect(result).to.deep.equal(expected);
  });

  it("should not add default pause at the end if {no pause} is specified as part of the last line", function () {
    const input = [
      {
        slide: 1,
        notes: ["First point. {no pause}"],
      },
    ];
    const expected = [
      {
        slide: 1,
        scripts: [{ pause: "SLIDE_START_DELAY" }, { text: "First point." }],
      },
    ];
    const result = createScriptsFromPresenterNotes(input);
    expect(result).to.deep.equal(expected);
  });
});
