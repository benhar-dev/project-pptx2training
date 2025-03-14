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
          { text: "Hello world!\n\nThis is a test.", voice: "default" },
          { pause: "SLIDE_END_DELAY" },
        ],
      },
      {
        slide: 2,
        scripts: [
          { pause: "SLIDE_START_DELAY" },
          { text: "Hello world!\n\nThis is a second test.", voice: "default" },
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
          { text: "Welcome to the presentation.", voice: "default" },
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
          { text: "Welcome to the presentation.", voice: "default" },
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
          { text: "This is an introduction.", voice: "default" },
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
        scripts: [
          { pause: "SLIDE_START_DELAY" },
          { text: "First point.", voice: "default" },
        ],
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
        scripts: [
          { pause: "SLIDE_START_DELAY" },
          { text: "First point.", voice: "default" },
        ],
      },
    ];
    const result = createScriptsFromPresenterNotes(input);
    expect(result).to.deep.equal(expected);
  });
  it("should handle speaker changes correctly", function () {
    const input = [
      {
        slide: 1,
        notes: [
          "{speaker 'Alice'}Hello from Alice.",
          "{speaker 'Bob'}Greetings from Bob.",
        ],
      },
    ];
    const expected = [
      {
        slide: 1,
        scripts: [
          { pause: "SLIDE_START_DELAY" },
          { text: "Hello from Alice.", voice: "Alice" },
          { text: "Greetings from Bob.", voice: "Bob" },
          { pause: "SLIDE_END_DELAY" },
        ],
      },
    ];
    const result = createScriptsFromPresenterNotes(input);
    expect(result).to.deep.equal(expected);
  });
  it("should not add default pause at the start or end when both {no pause} directives are used", function () {
    const input = [
      {
        slide: 1,
        notes: ["{no pause}Start immediately.", "End without delay.{no pause}"],
      },
    ];
    const expected = [
      {
        slide: 1,
        scripts: [
          {
            text: "Start immediately.\n\nEnd without delay.",
            voice: "default",
          },
        ],
      },
    ];
    const result = createScriptsFromPresenterNotes(input);
    expect(result).to.deep.equal(expected);
  });

  it("should correctly process a mix of pauses and speaker changes", function () {
    const input = [
      {
        slide: 1,
        notes: [
          "{speaker 'Alice'}Hello {pause 2000}",
          "{speaker 'Bob'}Greetings{no pause}",
        ],
      },
    ];
    const expected = [
      {
        slide: 1,
        scripts: [
          { pause: "SLIDE_START_DELAY" },
          { text: "Hello", voice: "Alice" },
          { pause: 2000 },
          { text: "Greetings", voice: "Bob" },
        ],
      },
    ];
    const result = createScriptsFromPresenterNotes(input);
    expect(result).to.deep.equal(expected);
  });

  it("should correctly process speaker changes", function () {
    const input = [
      {
        slide: 1,
        notes: [
          "{speaker 'Alice'}Hello my name is Alice, {speaker 'Bob'}and my name is Bob",
        ],
      },
    ];
    const expected = [
      {
        slide: 1,
        scripts: [
          { pause: "SLIDE_START_DELAY" },
          { text: "Hello my name is Alice,", voice: "Alice" },
          { text: "and my name is Bob", voice: "Bob" },
          { pause: "SLIDE_END_DELAY" },
        ],
      },
    ];
    const result = createScriptsFromPresenterNotes(input);
    expect(result).to.deep.equal(expected);
  });

  it("should correctly ignore {no pause} which are not at the start or end", function () {
    const input = [
      {
        slide: 1,
        notes: [
          "{speaker 'Alice'}{no pause}Hello my name is {no pause}Alice, {speaker 'Bob'}and my name is {no pause}Bob",
        ],
      },
    ];
    const expected = [
      {
        slide: 1,
        scripts: [
          { pause: "SLIDE_START_DELAY" },
          { text: "Hello my name is Alice,", voice: "Alice" },
          { text: "and my name is Bob", voice: "Bob" },
          { pause: "SLIDE_END_DELAY" },
        ],
      },
    ];
    const result = createScriptsFromPresenterNotes(input);
    expect(result).to.deep.equal(expected);
  });
  it("should handle speaker changes and keep them for the next slides", function () {
    const input = [
      {
        slide: 1,
        notes: [
          "{speaker 'Alice'}Hello from Alice.",
          "{speaker 'Bob'}Greetings from Bob.",
        ],
      },
      {
        slide: 2,
        notes: ["This is still Bob", "{speaker 'Alice'}Swapping to Alice."],
      },
      {
        slide: 3,
        notes: ["This is still Alice"],
      },
    ];
    const expected = [
      {
        slide: 1,
        scripts: [
          { pause: "SLIDE_START_DELAY" },
          { text: "Hello from Alice.", voice: "Alice" },
          { text: "Greetings from Bob.", voice: "Bob" },
          { pause: "SLIDE_END_DELAY" },
        ],
      },
      {
        slide: 2,
        scripts: [
          { pause: "SLIDE_START_DELAY" },
          { text: "This is still Bob", voice: "Bob" },
          { text: "Swapping to Alice.", voice: "Alice" },
          { pause: "SLIDE_END_DELAY" },
        ],
      },
      {
        slide: 3,
        scripts: [
          { pause: "SLIDE_START_DELAY" },
          { text: "This is still Alice", voice: "Alice" },
          { pause: "SLIDE_END_DELAY" },
        ],
      },
    ];
    const result = createScriptsFromPresenterNotes(input);
    expect(result).to.deep.equal(expected);
  });
});
