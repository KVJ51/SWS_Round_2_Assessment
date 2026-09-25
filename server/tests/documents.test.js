const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../src/app');
const Document = require('../src/models/Document');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('Document Management API', () => {
  // 1. Successful document upload
  test('1. Successful document upload (.txt)', async () => {
    const res = await request(app)
      .post('/api/documents')
      .attach('document', Buffer.from('This is a test document content.'), 'test.txt');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Document uploaded successfully');
    expect(res.body.document).toHaveProperty('_id');
    expect(res.body.document.originalName).toBe('test.txt');
    expect(res.body.document).not.toHaveProperty('path');
    expect(res.body.document).not.toHaveProperty('extractedText');

    // Clean up created file from uploads
    const docInDb = await Document.findById(res.body.document._id);
    if (docInDb && fs.existsSync(docInDb.path)) {
      fs.unlinkSync(docInDb.path);
    }
  });

  // 2. Unsupported file type
  test('2. Unsupported file type returns 400', async () => {
    const res = await request(app)
      .post('/api/documents')
      .attach('document', Buffer.from('fake image content'), 'image.png');

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Unsupported file extension/i);
  });

  // 3. Missing upload
  test('3. Missing upload returns 400', async () => {
    const res = await request(app)
      .post('/api/documents');

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/No file uploaded/i);
  });

  // 4. Invalid JSON upload
  test('4. Invalid JSON upload returns 400', async () => {
    const res = await request(app)
      .post('/api/documents')
      .attach('document', Buffer.from('{ invalid json: true, '), 'data.json');

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid JSON/i);
  });

  // 5. Document listing
  test('5. Document listing returns array of documents without extractedText or path', async () => {
    await Document.create({
      originalName: 'policy.md',
      storedName: '123-policy.md',
      mimeType: 'text/markdown',
      size: 512,
      path: 'uploads/fake-policy.md',
      extractedText: 'Secret extracted text content'
    });

    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('documents');
    expect(res.body.documents.length).toBe(1);
    expect(res.body.documents[0].originalName).toBe('policy.md');
    expect(res.body.documents[0].extractedText).toBeUndefined();
    expect(res.body.documents[0].path).toBeUndefined();
  });

  // 6. Newest documents appearing first
  test('6. Newest documents appear first in listing', async () => {
    const oldDoc = await Document.create({
      originalName: 'older.txt',
      storedName: '1-older.txt',
      mimeType: 'text/plain',
      size: 100,
      path: 'uploads/1-older.txt',
      extractedText: 'Old doc text',
      createdAt: new Date(Date.now() - 10000)
    });

    const newDoc = await Document.create({
      originalName: 'newer.txt',
      storedName: '2-newer.txt',
      mimeType: 'text/plain',
      size: 200,
      path: 'uploads/2-newer.txt',
      extractedText: 'New doc text',
      createdAt: new Date(Date.now())
    });

    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(200);
    expect(res.body.documents.length).toBe(2);
    expect(res.body.documents[0].originalName).toBe('newer.txt');
    expect(res.body.documents[1].originalName).toBe('older.txt');
  });

  // 7. Invalid document ID
  test('7. Invalid document ID returns 400', async () => {
    const res = await request(app).get('/api/documents/invalid-mongo-id/download');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid document ID.');
  });

  // 8. Missing document returns 404
  test('8. Missing document returns 404', async () => {
    const nonExistentId = '65fc1234abcd1234abcd1234';
    const res = await request(app).get(`/api/documents/${nonExistentId}/download`);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  // 9. Document download
  test('9. Document download serves the physical file', async () => {
    const uploadRes = await request(app)
      .post('/api/documents')
      .attach('document', Buffer.from('Downloadable test file content'), 'download_test.txt');

    const docId = uploadRes.body.document._id;
    const downloadRes = await request(app).get(`/api/documents/${docId}/download`);

    expect(downloadRes.status).toBe(200);
    expect(downloadRes.text).toBe('Downloadable test file content');
    expect(downloadRes.headers['content-disposition']).toMatch(/download_test\.txt/);

    // Clean up
    const docInDb = await Document.findById(docId);
    if (docInDb && fs.existsSync(docInDb.path)) {
      fs.unlinkSync(docInDb.path);
    }
  });

  // 10. Document deletion & 11. Verify deletion removes database record
  test('10 & 11. Document deletion removes file and database record', async () => {
    const uploadRes = await request(app)
      .post('/api/documents')
      .attach('document', Buffer.from('To be deleted'), 'delete_test.txt');

    const docId = uploadRes.body.document._id;
    const docBefore = await Document.findById(docId);
    expect(docBefore).not.toBeNull();
    expect(fs.existsSync(docBefore.path)).toBe(true);

    const deleteRes = await request(app).delete(`/api/documents/${docId}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toMatch(/deleted successfully/i);

    // Verify DB record removed
    const docAfter = await Document.findById(docId);
    expect(docAfter).toBeNull();
    // Verify physical file removed
    expect(fs.existsSync(docBefore.path)).toBe(false);
  });
});
