const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { extractTextFromFile, deleteFile } = require('../services/file.service');

const isDbConnected = () => mongoose.connection.readyState === 1;

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
    if (!isDbConnected()) {
      await deleteFile(filePath);
      return res.status(503).json({
        message: 'Database is currently not connected. Please ensure MongoDB is running.'
      });
    }

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
      message: error.message || 'An error occurred while processing the document'
    });
  }
};

/**
 * Controller to list all documents
 * GET /api/documents
 */
const getDocuments = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        message: 'Database is currently not connected. Please ensure MongoDB is running.'
      });
    }

    const documents = await Document.find({})
      .select('_id originalName mimeType size createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      documents
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Failed to retrieve documents'
    });
  }
};

/**
 * Controller to get a single document by ID
 * GET /api/documents/:id
 */
const getDocumentById = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: 'Invalid document ID.'
    });
  }

  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        message: 'Database is currently not connected. Please ensure MongoDB is running.'
      });
    }

    const document = await Document.findById(id).select('_id originalName mimeType size createdAt');

    if (!document) {
      return res.status(404).json({
        message: 'Document not found.'
      });
    }

    return res.status(200).json({
      document
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Failed to retrieve document'
    });
  }
};

/**
 * Controller to download a document
 * GET /api/documents/:id/download
 */
const downloadDocument = async (req, res, next) => {
  const { id } = req.params;

  // Validate MongoDB ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: 'Invalid document ID.'
    });
  }

  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        message: 'Database is currently not connected. Please ensure MongoDB is running.'
      });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        message: 'Document not found.'
      });
    }

    // Check if physical file exists on disk
    if (!fs.existsSync(document.path)) {
      return res.status(404).json({
        message: 'Physical file not found on server.'
      });
    }

    // Send file as download preserving original filename
    return res.download(document.path, document.originalName, (err) => {
      if (err && !res.headersSent) {
        return res.status(500).json({
          message: 'Error downloading the file',
          error: err.message
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Failed to process download request'
    });
  }
};

/**
 * Controller to delete a document
 * DELETE /api/documents/:id
 */
const deleteDocument = async (req, res, next) => {
  const { id } = req.params;

  // Validate MongoDB ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: 'Invalid document ID.'
    });
  }

  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        message: 'Database is currently not connected. Please ensure MongoDB is running.'
      });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        message: 'Document not found.'
      });
    }

    // Delete associated physical file from disk (handles missing file safely)
    await deleteFile(document.path);

    // Delete MongoDB document metadata
    await Document.findByIdAndDelete(id);

    return res.status(200).json({
      message: 'Document and associated file deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Failed to delete document'
    });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  deleteDocument
};
