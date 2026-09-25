import React, { useState, useEffect } from 'react';
import UploadZone from '../components/UploadZone';
import DocumentList from '../components/DocumentList';
import { fetchDocuments, deleteDocument } from '../services/api';

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError('');
      const docs = await fetchDocuments();
      setDocuments(docs || []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load documents';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUploadSuccess = (newDoc) => {
    // Add new document at the beginning of the list (newest first)
    setDocuments((prev) => [newDoc, ...prev.filter((d) => d._id !== newDoc._id)]);
  };

  const handleDeleteDocument = async (id) => {
    await deleteDocument(id);
    setDocuments((prev) => prev.filter((doc) => doc._id !== id));
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-grid">
        <UploadZone onUploadSuccess={handleUploadSuccess} />
        <DocumentList
          documents={documents}
          isLoading={isLoading}
          error={error}
          onDeleteDocument={handleDeleteDocument}
          onRefresh={loadDocuments}
        />
      </div>
    </div>
  );
}

export default Dashboard;
