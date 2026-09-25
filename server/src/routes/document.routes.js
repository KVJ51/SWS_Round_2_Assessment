const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/upload.middleware');
const { uploadDocument } = require('../controllers/document.controller');

// POST /api/documents - Upload a document (.txt, .md, .json)
router.post('/', uploadMiddleware, uploadDocument);

module.exports = router;
