import React, { useState, useRef } from 'react';
import { uploadDocument } from '../services/api';

function UploadZone({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  const allowedExtensions = ['.txt', '.md', '.json'];

  const validateFile = (file) => {
    if (!file) return 'Please select a file to upload.';
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return `Unsupported file format (${ext}). Only .txt, .md, and .json files are allowed.`;
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'File size exceeds maximum allowed limit of 5 MB.';
    }
    return null;
  };

  const handleFileProcess = async (file) => {
    setErrorMessage('');
    setSuccessMessage('');

    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadDocument(file);
      setSuccessMessage(`"${file.name}" uploaded successfully!`);
      if (onUploadSuccess) onUploadSuccess(res.document);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to upload document.';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  return (
    <div className="upload-section">
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".txt,.md,.json"
          style={{ display: 'none' }}
          disabled={isUploading}
        />

        <div className="upload-icon-wrapper">
          {isUploading ? (
            <div className="spinner"></div>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          )}
        </div>

        <div className="upload-text">
          {isUploading ? (
            <p className="upload-primary-text">Uploading & extracting content...</p>
          ) : (
            <>
              <p className="upload-primary-text">
                <span className="upload-link-text">Click to upload</span> or drag and drop
              </p>
              <p className="upload-hint-text">Supported formats: .txt, .md, .json (Max 5 MB)</p>
            </>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="alert alert-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}

export default UploadZone;
