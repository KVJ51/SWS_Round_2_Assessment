const path = require('path');
const Document = require('../models/Document');
const { extractTextFromFile, deleteFile } = require('../services/file.service');

/**
 * Controller to handle document upload
 * POST /api/documents
 */
const uploadDocument = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      message: 'No file uploaded. Please upload a file with field name "document".'
    });
  }

  const { path: filePath, originalname, filename, mimetype, size } = req.file;
  const ext = path.extname(originalname).toLowerCase();

  try {
    // Extract and validate content
    const extractedText = await extractTextFromFile(filePath, ext);

    // Save document to MongoDB
    const document = new Document({
      originalName: originalname,
      storedName: filename,
      mimeType: mimetype,
      size,
      path: filePath,
      extractedText
    });

    await document.save();

    return res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        _id: document._id,
        originalName: document.originalName,
        mimeType: document.mimeType,
        size: document.size,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    // Delete the uploaded physical file if validation or database save fails
    await deleteFile(filePath);

    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({
      message: 'An error occurred while processing the document',
      error: error.message
    });
  }
};

module.exports = {
  uploadDocument
};
