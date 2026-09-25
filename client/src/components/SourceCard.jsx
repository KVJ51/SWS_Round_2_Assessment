import React from 'react';

function SourceCard({ source }) {
  return (
    <div className="source-badge">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
      <span className="source-name" title={source.originalName}>
        {source.originalName}
      </span>
      <span className="source-score" title="Keyword relevance score">
        Score: {source.score}
      </span>
    </div>
  );
}

export default SourceCard;
