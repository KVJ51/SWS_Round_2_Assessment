import React from 'react';
import DocumentCard from './DocumentCard';

function DocumentList({ documents, isLoading, error, onDeleteDocument, onRefresh }) {
  if (isLoading) {
    return (
      <div className="doc-list-state">
        <div className="spinner"></div>
        <p>Loading documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doc-list-state error-state">
        <p>{error}</p>
        <button onClick={onRefresh} className="btn btn-secondary btn-sm">
          Try Again
        </button>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="doc-list-empty">
        <div className="empty-icon-wrapper">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3>No documents uploaded yet</h3>
        <p>Upload your .txt, .md, or .json files above to start asking questions with AI.</p>
      </div>
    );
  }

  return (
    <div className="doc-list-container">
      <div className="doc-list-header">
        <h2>Your Documents ({documents.length})</h2>
        <button onClick={onRefresh} className="btn-icon" title="Refresh document list">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </button>
      </div>

      <div className="doc-grid">
        {documents.map((doc) => (
          <DocumentCard key={doc._id} doc={doc} onDelete={onDeleteDocument} />
        ))}
      </div>
    </div>
  );
}

export default DocumentList;
