import fs from "fs/promises";

// Async function to load the dictionary and replace words in the scripts
async function customizeScripts(scripts) {
  try {
    // Load the dictionary.json file
    const dictionaryData = await fs.readFile("dictionary.json", "utf-8");
    const dictionary = JSON.parse(dictionaryData);

    // Create a lowercase dictionary for case-insensitive matching
    const lowerCaseDictionary = Object.keys(dictionary).reduce((acc, key) => {
      acc[key.toLowerCase()] = dictionary[key];
      return acc;
    }, {});

    // Function to replace words based on the dictionary
    const replaceWords = (text) => {
      return text.replace(/\b\w+\b/g, (match) => {
        const lowerCaseWord = match.toLowerCase();
        // Check if the lowercase word is in the dictionary
        if (lowerCaseDictionary.hasOwnProperty(lowerCaseWord)) {
          // Preserve the original case of the first letter
          if (match[0] === match[0].toUpperCase()) {
            return (
              lowerCaseDictionary[lowerCaseWord].charAt(0).toUpperCase() +
              lowerCaseDictionary[lowerCaseWord].slice(1)
            );
          }
          return lowerCaseDictionary[lowerCaseWord];
        }
        return match;
      });
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
