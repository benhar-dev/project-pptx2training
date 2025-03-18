import { expect } from "chai";
import { customizeScripts } from "../src/customize-scripts.js";
import sinon from "sinon";
import fs from "fs/promises";

describe("customizeScripts Function", () => {
  let readFileStub;

  beforeEach(() => {
    // Stub fs.readFile to return a mock dictionary.json
    readFileStub = sinon.stub(fs, "readFile");
    readFileStub.resolves(
      JSON.stringify({
        "\\b4024\\b": "40 24",
        "\\b4026\\b": "40 26",
        "HTTP://": "http colon, forward slash, forward slash",
        "HTTPS://": "https colon, forward slash, forward slash",
        "\\bBeckhoff\\b": "beckoff",
        "\\bTwinCAT\\b": "twin-cat",
        "\\bEtherCAT\\b": "ether-cat",
      })
    );
  });

  afterEach(() => {
    // Restore the original fs.readFile function
    sinon.restore();
  });

  it("should replace words in script text according to the dictionary", async () => {
    const scripts = [
      {
        scripts: [
          {
            text: "We use 4024 and 4026 with HTTP://example.com and Beckhoff systems like TwinCAT and EtherCAT.",
          },
        ],
      },
    ];

    const expectedScripts = [
      {
        scripts: [
          {
            text: "We use 40 24 and 40 26 with http colon, forward slash, forward slashexample.com and beckoff systems like twin-cat and ether-cat.",
          },
        ],
      },
    ];

    const result = await customizeScripts(scripts);
    expect(result).to.deep.equal(expectedScripts);
  });

  it("should handle cases where no replacements are needed", async () => {
    const scripts = [
      {
        scripts: [
          {
            text: "No replacements here.",
          },
        ],
      },
    ];

    const expectedScripts = [
      {
        scripts: [
          {
            text: "No replacements here.",
          },
        ],
      },
    ];

    const result = await customizeScripts(scripts);
    expect(result).to.deep.equal(expectedScripts);
  });

  it("should handle cases of https://", async () => {
    const scripts = [
      {
        scripts: [
          {
            text: "To access your controller, you must first type HTTPS:// then the IP address of your IPC.  This will present you with two options.  Device manager and web console. Select web console to continue.",
          },
        ],
      },
    ];

    const expectedScripts = [
      {
        scripts: [
          {
            text: "To access your controller, you must first type https colon, forward slash, forward slash then the IP address of your IPC.  This will present you with two options.  Device manager and web console. Select web console to continue.",
          },
        ],
      },
    ];

    const result = await customizeScripts(scripts);
    expect(result).to.deep.equal(expectedScripts);
  });
});
