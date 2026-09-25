const { retrieveRelevantDocuments } = require('../services/retrieval.service');
const { generateAnswer } = require('../services/ai.service');

/**
 * Controller to handle AI question answering
 * POST /api/chat
 */
const askQuestion = async (req, res, next) => {
  const { question } = req.body;

  // 1. Validate question exists and is not empty
  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({
      message: 'Question is required and cannot be empty.'
    });
  }

  try {
    const trimmedQuestion = question.trim();

    // 2. Retrieve top 3 relevant documents
    const relevantDocs = await retrieveRelevantDocuments(trimmedQuestion, 3);

    // 3. If no relevant documents found
    if (!relevantDocs || relevantDocs.length === 0) {
      return res.status(200).json({
        answer: "I couldn't find relevant information in your uploaded documents.",
        sources: []
      });
    }

    // 4. Generate answer from context using AI service (Gemini or Mock fallback)
    const answer = await generateAnswer(trimmedQuestion, relevantDocs);

    // 5. Format sources
    const sources = relevantDocs.map(doc => ({
      _id: doc._id,
      originalName: doc.originalName,
      score: doc.score
    }));

    return res.status(200).json({
      answer,
      sources
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to generate answer',
      error: error.message
    });
  }
};

module.exports = {
  askQuestion
};
