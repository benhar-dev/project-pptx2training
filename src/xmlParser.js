const xml2js = require("xml2js");

async function parseXML(contents) {
  const parser = new xml2js.Parser();
  const parsedContents = [];
  for (let content of contents) {
    const parsedContent = await parser.parseStringPromise(content.content);
    parsedContents.push({ ...content, parsedContent });
  }
  return parsedContents;
}

module.exports = { parseXML };
