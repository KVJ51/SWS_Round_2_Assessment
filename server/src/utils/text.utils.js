const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot', 'could',
  'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down',
  'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has',
  'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her',
  'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s',
  'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it',
  'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my',
  'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t',
  'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some',
  'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re',
  'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up',
  'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were',
  'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
  'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would',
  'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours',
  'yourself', 'yourselves'
]);

/**
 * Normalizes and extracts meaningful keyword tokens from text
 * @param {string} text - Input text
 * @returns {string[]} Array of unique non-stopword tokens
 */
const extractKeywords = (text) => {
  if (!text || typeof text !== 'string') return [];

  // Lowercase, replace non-alphanumeric with spaces, split by whitespace
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));

  return [...new Set(words)];
};

/**
 * Calculates keyword overlap score between question keywords and document text
 * @param {string[]} keywords - Array of question keywords
 * @param {string} docText - Document's extracted text
 * @returns {{ score: number, matchedKeywords: string[] }}
 */
const calculateScore = (keywords, docText) => {
  if (!keywords || keywords.length === 0 || !docText) {
    return { score: 0, matchedKeywords: [] };
  }

  const normalizedDocText = docText.toLowerCase();
  const matchedKeywords = [];

  for (const keyword of keywords) {
    // Check if whole word or root keyword matches
    const regex = new RegExp(`\\b${keyword}`, 'i');
    if (regex.test(normalizedDocText) || normalizedDocText.includes(keyword)) {
      matchedKeywords.push(keyword);
    }
  }

  return {
    score: matchedKeywords.length,
    matchedKeywords
  };
};

/**
 * Extracts a relevant snippet from the document text around matched keywords
 * @param {string} text - Document full text
 * @param {string[]} matchedKeywords - List of matched keywords
 * @param {number} snippetLength - Maximum length of snippet (default 250)
 * @returns {string} Text snippet with ellipsis
 */
const extractSnippet = (text, matchedKeywords = [], snippetLength = 250) => {
  if (!text) return '';

  const cleanText = text.replace(/\s+/g, ' ').trim();
  if (cleanText.length <= snippetLength) return cleanText;

  // Find position of first matched keyword
  let bestIndex = 0;
  for (const kw of matchedKeywords) {
    const idx = cleanText.toLowerCase().indexOf(kw.toLowerCase());
    if (idx !== -1) {
      bestIndex = idx;
      break;
    }
  }

  const start = Math.max(0, bestIndex - Math.floor(snippetLength / 4));
  const end = Math.min(cleanText.length, start + snippetLength);

  let snippet = cleanText.slice(start, end).trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < cleanText.length) snippet = snippet + '...';

  return snippet;
};

module.exports = {
  STOP_WORDS,
  extractKeywords,
  calculateScore,
  extractSnippet
};
