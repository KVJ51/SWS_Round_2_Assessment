const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/upload.middleware');
const {
  uploadDocument,
  getDocuments,
  downloadDocument
} = require('../controllers/document.controller');

// POST /api/documents - Upload a document (.txt, .md, .json)
router.post('/', uploadMiddleware, uploadDocument);

// GET /api/documents - List all documents
router.get('/', getDocuments);

// GET /api/documents/:id/download - Download a document
router.get('/:id/download', downloadDocument);

module.exports = router;
