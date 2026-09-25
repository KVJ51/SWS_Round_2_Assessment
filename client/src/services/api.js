import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000
});

// Document APIs
export const fetchDocuments = async () => {
  const response = await api.get('/documents');
  return response.data.documents;
};

export const uploadDocument = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('document', file);

  const response = await api.post('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress
  });
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};

export const getDownloadUrl = (id) => {
  return `/api/documents/${id}/download`;
};

// Chat API
export const sendChatMessage = async (question) => {
  const response = await api.post('/chat', { question });
  return response.data;
};

export default api;
