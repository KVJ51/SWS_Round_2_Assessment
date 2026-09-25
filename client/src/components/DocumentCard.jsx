import React, { useState } from 'react';
import { getDownloadUrl } from '../services/api';

function DocumentCard({ doc, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === undefined || bytes === null) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileExtension = (name) => {
    const ext = name.split('.').pop()?.toLowerCase();
    return ext ? `.${ext}` : 'doc';
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${doc.originalName}"?`)) {
      try {
        setIsDeleting(true);
        await onDelete(doc._id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="doc-card">
      <div className="doc-card-header">
        <div className="doc-icon-badge">
          {getFileExtension(doc.originalName)}
        </div>
        <div className="doc-info">
          <h3 className="doc-name" title={doc.originalName}>
            {doc.originalName}
          </h3>
          <div className="doc-meta">
            <span className="doc-meta-item">{formatFileSize(doc.size)}</span>
            <span className="doc-dot">•</span>
            <span className="doc-meta-item">{formatDate(doc.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="doc-actions">
        <a
          href={getDownloadUrl(doc._id)}
          className="btn btn-secondary btn-sm"
          download
          title="Download file"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download
        </a>

        <button
          onClick={handleDelete}
          className="btn btn-danger btn-sm"
          disabled={isDeleting}
          title="Delete document"
        >
          {isDeleting ? (
            <span className="btn-spinner"></span>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          )}
          Delete
        </button>
      </div>
    </div>
  );
}

export default DocumentCard;
