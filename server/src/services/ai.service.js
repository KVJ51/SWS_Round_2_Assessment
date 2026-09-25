const { generateMockAnswer } = require('./mock-ai.service');

/**
 * Calls Gemini REST API to answer question based on document context
 * @param {string} question - User question
 * @param {string} context - Document context snippets
 * @param {string} apiKey - Gemini API key
 * @param {string} model - Gemini model name
 * @returns {Promise<string>}
 */
const callGeminiApi = async (question, context, apiKey, model) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `You are DocuMind AI, an intelligent document assistant.
Your task is to answer the user's question accurately and concisely based ONLY on the provided document context.

Strict Rules:
1. Answer ONLY using the facts present in the Context below.
2. Do NOT invent, assume, or extrapolate information not found in the context.
3. If the context does not contain enough information to answer the question, state: "I couldn't find the answer in the provided documents."
4. Keep answers concise, factual, and helpful.

--- Document Context ---
${context}
--- End of Context ---

Question: ${question}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 500
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini API returned an empty or invalid response format');
  }

  return text.trim();
};

/**
 * Main AI answer generation function with automatic fallback
 * @param {string} question - User question
 * @param {Array<{ _id: string, originalName: string, score: number, snippet: string, extractedText?: string }>} relevantDocs - Retrieved documents
 * @returns {Promise<string>} Answer string
 */
const generateAnswer = async (question, relevantDocs = []) => {
  if (!relevantDocs || relevantDocs.length === 0) {
    return "I couldn't find relevant information in your uploaded documents.";
  }

  const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  // Build context using snippets from relevant documents
  const context = relevantDocs
    .map((doc, idx) => `[Document ${idx + 1}: "${doc.originalName}"]\n${doc.snippet || doc.extractedText}`)
    .join('\n\n');

  if (provider === 'gemini' && apiKey) {
    try {
      return await callGeminiApi(question, context, apiKey, model);
    } catch (err) {
      console.warn(`Gemini API call failed (${err.message}). Falling back to mock AI provider.`);
      return generateMockAnswer(question, relevantDocs);
    }
  }

  // Default to mock provider
  return generateMockAnswer(question, relevantDocs);
};

module.exports = {
  generateAnswer,
  callGeminiApi
};
