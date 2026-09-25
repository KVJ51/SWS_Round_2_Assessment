const express = require('express');
const router = express.Router();
const { askQuestion } = require('../controllers/chat.controller');

// POST /api/chat - Ask question over uploaded documents
router.post('/', askQuestion);

module.exports = router;
