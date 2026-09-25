/**
 * Mock AI service that extracts a concise answer from document context without requiring an external API key.
 * @param {string} question - User question
 * @param {Array<{ originalName: string, snippet: string, extractedText?: string }>} relevantDocs - Retrieved documents
 * @returns {string} Generated mock answer
 */
const generateMockAnswer = (question, relevantDocs = []) => {
  if (!relevantDocs || relevantDocs.length === 0) {
    return "I couldn't find relevant information in your uploaded documents.";
  }

  // Combine snippets
  const snippets = relevantDocs
    .map(doc => doc.snippet || (doc.extractedText ? doc.extractedText.slice(0, 200) : ''))
    .filter(Boolean)
    .join(' ');

  // Clean snippets
  const cleanSnippet = snippets.replace(/\.\.\./g, '').replace(/\s+/g, ' ').trim();

  const docNames = relevantDocs.map(d => d.originalName).join(', ');

  return `Based on the information found in ${docNames}: ${cleanSnippet}`;
};

module.exports = {
  generateMockAnswer
};
