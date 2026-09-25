const fs = require('fs').promises;
const path = require('path');

/**
 * Extracts text content from uploaded file based on its extension
 * @param {string} filePath - Absolute path to the file
 * @param {string} ext - Extension of the file (e.g. .txt, .md, .json)
 * @returns {Promise<string>} Extracted text
 */
const extractTextFromFile = async (filePath, ext) => {
  const fileContent = await fs.readFile(filePath, 'utf8');

  if (ext === '.json') {
    try {
      JSON.parse(fileContent);
    } catch (parseErr) {
      const error = new Error('Invalid JSON content. Please upload a valid JSON file.');
      error.statusCode = 400;
      throw error;
    }
  }

  return fileContent;
};

/**
 * Deletes a file from the filesystem if it exists
 * @param {string} filePath - Path of file to delete
 */
const deleteFile = async (filePath) => {
  try {
    if (filePath) {
      await fs.unlink(filePath);
    }
  } catch (err) {
    console.error(`Failed to delete file at ${filePath}:`, err.message);
  }
};

module.exports = {
  extractTextFromFile,
  deleteFile
};
