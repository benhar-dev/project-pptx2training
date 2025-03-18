import fs from "fs/promises";

// Async function to load the dictionary and replace words in the scripts
async function customizeScripts(scripts) {
  try {
    // Load the dictionary.json file
    const dictionaryData = await fs.readFile("dictionary.json", "utf-8");
    const dictionary = JSON.parse(dictionaryData);

    // Function to replace words based on regex patterns from the dictionary
    const replaceWords = (text) => {
      // Iterate over each pattern in the dictionary
      for (const [pattern, replacement] of Object.entries(dictionary)) {
        // Create a regex from the pattern, ensure to escape special characters if needed
        const regex = new RegExp(pattern, "gi"); // 'g' for global, 'i' for case-insensitive
        text = text.replace(regex, replacement);
      }
      return text;
    };

    // Iterate over each slide in the scripts array
    for (const slide of scripts) {
      for (const script of slide.scripts) {
        // Check if the script has a 'text' field to replace words
        if (script.text) {
          script.text = replaceWords(script.text);
        }
      }
    }

    return scripts; // Return the modified scripts
  } catch (error) {
    console.error("Error customizing scripts:", error);
    throw error; // Rethrow the error for further handling
  }
}

export { customizeScripts };
