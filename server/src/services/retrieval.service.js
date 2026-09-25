const Document = require('../models/Document');
const { extractKeywords, calculateScore, extractSnippet } = require('../utils/text.utils');

/**
 * Retrieves the top relevant documents for a given user question based on keyword overlap
 * @param {string} question - User question string
 * @param {number} [limit=3] - Maximum number of relevant documents to return
 * @returns {Promise<Array<{ _id: string, originalName: string, score: number, snippet: string, extractedText: string }>>}
 */
const retrieveRelevantDocuments = async (question, limit = 3) => {
  if (!question || typeof question !== 'string' || !question.trim()) {
    return [];
  }

  // 1. Extract non-stopword keywords from normalized question
  const keywords = extractKeywords(question);
  if (keywords.length === 0) {
    return [];
  }

  // 2. Fetch all stored documents with text from MongoDB
  const documents = await Document.find({}).lean();
  if (!documents || documents.length === 0) {
    return [];
  }

  // 3. Score each document based on keyword overlap
  const scoredDocuments = [];

  for (const doc of documents) {
    const { score, matchedKeywords } = calculateScore(keywords, doc.extractedText || '');

    // 4. Filter out documents with score 0
    if (score > 0) {
      const snippet = extractSnippet(doc.extractedText || '', matchedKeywords);
      scoredDocuments.push({
        _id: doc._id,
        originalName: doc.originalName,
        score,
        snippet,
        extractedText: doc.extractedText || '',
        createdAt: doc.createdAt
      });
    }
  }

  // 5. Sort by score descending, then by newest createdAt descending
  scoredDocuments.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // 6. Return top documents (default 3)
  return scoredDocuments.slice(0, limit);
};

module.exports = {
  retrieveRelevantDocuments
};
