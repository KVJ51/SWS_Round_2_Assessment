const request = require('supertest');
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

describe('Chat API', () => {
  // 12. Empty chat question
  test('12. Empty or missing chat question returns 400', async () => {
    const resEmpty = await request(app)
      .post('/api/chat')
      .send({ question: '   ' });

    expect(resEmpty.status).toBe(400);
    expect(resEmpty.body.message).toMatch(/Question is required/i);

    const resMissing = await request(app)
      .post('/api/chat')
      .send({});

    expect(resMissing.status).toBe(400);
    expect(resMissing.body.message).toMatch(/Question is required/i);
  });

  // 13 & 14. Successful chat question with answer and sources
  test('13 & 14. Successful chat question returns answer and sources', async () => {
    await Document.create({
      originalName: 'employee_benefits.md',
      storedName: '1-benefits.md',
      mimeType: 'text/markdown',
      size: 1024,
      path: 'uploads/1-benefits.md',
      extractedText: 'All employees receive 25 days of paid annual vacation leave and full dental insurance.'
    });

    const res = await request(app)
      .post('/api/chat')
      .send({ question: 'What is the vacation leave policy for employees?' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('answer');
    expect(typeof res.body.answer).toBe('string');
    expect(res.body).toHaveProperty('sources');
    expect(Array.isArray(res.body.sources)).toBe(true);
    expect(res.body.sources.length).toBeGreaterThan(0);
    expect(res.body.sources[0]).toHaveProperty('originalName', 'employee_benefits.md');
    expect(res.body.sources[0]).toHaveProperty('score');
    expect(res.body.sources[0].score).toBeGreaterThan(0);
  });

  // 15. Question with no relevant documents
  test('15. Question with no relevant documents returns friendly message and empty sources', async () => {
    await Document.create({
      originalName: 'recipe.txt',
      storedName: '1-recipe.txt',
      mimeType: 'text/plain',
      size: 512,
      path: 'uploads/1-recipe.txt',
      extractedText: 'Mix flour, sugar, and baking powder in a bowl.'
    });

    const res = await request(app)
      .post('/api/chat')
      .send({ question: 'What is the quantum mechanics wave function?' });

    expect(res.status).toBe(200);
    expect(res.body.answer).toMatch(/couldn't find relevant information/i);
    expect(res.body.sources).toEqual([]);
  });
});
