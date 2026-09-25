const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true
    },
    storedName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    extractedText: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
