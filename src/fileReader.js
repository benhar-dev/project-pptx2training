const fs = require("fs");

async function readFileContent(filePath) {
  return await fs.promises.readFile(filePath);
}

module.exports = { readFileContent };
