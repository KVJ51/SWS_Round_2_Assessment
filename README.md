# DocuMind AI

> **Intelligent Document Management & AI-Powered Question-Answering Assistant**

DocuMind AI is a full-stack MERN application that allows users to upload, manage, and interact with their documents using artificial intelligence. Users can upload plain text, Markdown, and JSON documents, search across their library using a keyword-overlap retrieval engine, and ask contextual questions to receive AI-generated answers with source citations.

---

## 📑 Table of Contents
- [Architecture & Workflow](#-architecture--workflow)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Detailed Module & Function Breakdown](#-detailed-module--function-breakdown)
- [API Documentation (OpenAPI / Swagger)](#-api-documentation-openapi--swagger)
- [Getting Started](#-getting-started)
- [Running Automated Tests](#-running-automated-tests)
- [Error Handling & Reliability](#-error-handling--reliability)

---

## 🏛 Architecture & Workflow

DocuMind AI follows a Retrieval-Augmented Generation (RAG) pattern designed to work reliably without external vector database dependencies:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DocuMind AI Workflow                                       │
│                                                                                                  │
│   Upload Document  ──► Store & Extract Content ──► Keyword Retrieval ──► Context Formulation     │
│                                                            │                      │              │
│                                                            ▼                      ▼              │
│   Return Sources  ◄───  Deliver Final Answer   ◄─── Answer Generation ◄── Ask Question          │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### End-to-End System Architecture

```
                                  +---------------------------------------+
                                  |     React Client (Vite + CSS)         |
                                  |   (Port 5173 / Minimalist Light UI)   |
                                  +-------------------+-------------------+
                                                      |
                                   HTTP / REST API    |   Axios / JSON
                                                      v
                                  +---------------------------------------+
                                  |      Express.js API Server (Port 5000)|
                                  +-------------------+-------------------+
                                                      |
                    +---------------------------------+---------------------------------+
                    |                                 |                                 |
                    v                                 v                                 v
          +-------------------+             +-------------------+             +-------------------+
          | Document Service  |             | Retrieval Engine  |             | AI Service Layer  |
          | - Multer Uploads  |             | - Normalization   |             | - Gemini REST API |
          | - Text Extractor  |             | - Stopword Filter |             | - Mock Fallback   |
          | - Disk Storage    |             | - Overlap Scoring |             | - Context Builder |
          +---------+---------+             +---------+---------+             +---------+---------+
                    |                                 |                                 |
                    v                                 v                                 v
          +-------------------+             +-------------------+             +-------------------+
          | Local File System |             |      MongoDB      |             | Google Gemini API |
          | (server/uploads/) |             |    (Mongoose)     |             |  (REST Endpoint)  |
          +-------------------+             +-------------------+             +-------------------+
```

---

## ✨ Key Features

1. **Document Upload & Content Extraction**:
   - Supports `.txt`, `.md`, and `.json` file formats.
   - Enforces a 5 MB maximum file size limit.
   - Performs JSON syntax validation before storing.
   - Stores physical files on disk with unique timestamped filenames while saving extracted text into MongoDB.

2. **Document Management**:
   - Lists all uploaded documents sorted chronologically by newest first.
   - Preserves privacy by keeping internal disk paths and full text private from list responses.
   - Downloads files with their original filenames.
   - Synchronized deletion: removing a document purges both the database record and the physical disk file.

3. **Keyword-Overlap Retrieval Engine**:
   - Tokenizes and lowercases queries, stripping punctuation.
   - Eliminates standard English stop words.
   - Calculates a relevance score based on keyword matches across stored document contents.
   - Extracts 250-character preview snippets centered on the matched terms.
   - Returns the top 3 ranked documents.

4. **Context-Aware AI Assistant**:
   - Supports **Google Gemini REST API** (`gemini-2.5-flash`) and an **Offline Mock Mode** (`AI_PROVIDER=mock`).
   - Automatically falls back to mock answering if the Gemini API key is unavailable or rate-limited.
   - Displays citations under every AI response with the source document name and relevance score.

5. **Interactive Swagger / OpenAPI 3.0 Documentation**:
   - Fully interactive API Explorer available at `/api-docs`.

6. **Automated Integration Testing**:
   - Comprehensive test suite covering uploads, downloads, deletion, retrieval, and edge cases using Jest, Supertest, and MongoMemoryServer.

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | Single-Page Application (SPA) |
| **Styling** | Vanilla CSS | Minimalist Light Theme (Black & White primary palette) |
| **HTTP Client** | Axios | API communication with backend |
| **Backend** | Node.js, Express.js | REST API server |
| **File Handling** | Multer | Multipart form-data processing and disk storage |
| **Database** | MongoDB & Mongoose | Document metadata & extracted text storage |
| **AI / LLM** | Google Gemini API (REST) | Natural language question answering |
| **Testing** | Jest, Supertest, MongoMemoryServer | Integration and unit testing |
| **API Docs** | Swagger UI Express, OpenAPI 3.0 | Interactive API specification |

---

## 📂 Project Structure

```
Assessment/
├── .gitignore                      # Git ignore patterns
├── README.md                       # Comprehensive documentation
├── Task.md                         # Project specification & guidelines
│
├── server/                         # Express Backend
│   ├── .env                        # Environment configuration (ignored in git)
│   ├── .env.example                # Example environment template
│   ├── package.json                # Dependencies and scripts
│   ├── uploads/                    # Physical file storage directory
│   │   └── .gitkeep
│   ├── tests/                      # Automated Integration Tests
│   │   ├── setup.js                # In-memory MongoDB lifecycle setup
│   │   ├── documents.test.js       # Document CRUD integration tests
│   │   └── chat.test.js            # AI Q&A integration tests
│   └── src/
│       ├── app.js                  # Express application configuration & routing
│       ├── server.js               # Server entry point & listener
│       ├── swagger.js              # OpenAPI 3.0 specification & Swagger UI mount
│       ├── config/
│       │   └── db.js               # MongoDB connection with auto-embedded fallback
│       ├── controllers/
│       │   ├── document.controller.js  # Document upload, list, download, delete
│       │   └── chat.controller.js      # AI question-answering controller
│       ├── models/
│       │   └── Document.js         # Mongoose schema for document entries
│       ├── routes/
│       │   ├── document.routes.js  # Document endpoint definitions
│       │   └── chat.routes.js      # Chat endpoint definitions
│       ├── services/
│       │   ├── file.service.js     # Text extraction & file deletion utilities
│       │   ├── retrieval.service.js# Custom keyword-overlap retrieval engine
│       │   ├── ai.service.js       # Gemini REST API connector
│       │   └── mock-ai.service.js  # Offline fallback AI answer generator
│       ├── middleware/
│       │   ├── upload.middleware.js# Multer storage, extension & size validation
│       │   └── error.middleware.js # Centralized error & 404 handler
│       └── utils/
│           └── text.utils.js       # Tokenizer, stop words, scoring, snippet extractor
│
└── client/                         # React Frontend (Vite)
    ├── index.html                  # HTML entry page
    ├── package.json                # Frontend dependencies
    ├── vite.config.js              # Vite server & proxy configuration
    └── src/
        ├── App.jsx                 # Root layout & tab coordinator
        ├── App.css                 # Clean light-theme design system
        ├── index.css               # Global CSS variables & resets
        ├── main.jsx                # React DOM render root
        ├── components/
        │   ├── Navbar.jsx          # Top navigation bar
        │   ├── UploadZone.jsx      # Drag & drop upload area with progress/errors
        │   ├── DocumentCard.jsx    # Individual document card with download/delete
        │   ├── DocumentList.jsx    # Document list grid with empty/loading states
        │   ├── ChatWindow.jsx      # Conversation panel with starter questions
        │   ├── ChatMessage.jsx     # User & AI message bubbles
        │   └── SourceCard.jsx      # Citation badge with relevance score
        ├── pages/
        │   ├── Dashboard.jsx       # Document management view
        │   └── Assistant.jsx       # AI Assistant view
        └── services/
            └── api.js              # Axios service client
```

---

## 🔍 Detailed Module & Function Breakdown

### 1. Document Management (`server/src/controllers/document.controller.js`)
- `uploadDocument(req, res)`: Handles incoming `multipart/form-data`, validates extensions (`.txt`, `.md`, `.json`) and file size (≤ 5MB), extracts file text, and stores document metadata in MongoDB.
- `getDocuments(req, res)`: Retrieves all documents sorted by `createdAt: -1` while projecting out internal paths and raw text.
- `getDocumentById(req, res)`: Validates MongoDB ObjectId and retrieves metadata for a single document.
- `downloadDocument(req, res)`: Validates document presence and disk existence, then streams the file to the client with `Content-Disposition`.
- `deleteDocument(req, res)`: Unlinks the file from `server/uploads/` and deletes the MongoDB record.

### 2. Retrieval Engine (`server/src/services/retrieval.service.js` & `text.utils.js`)
- `extractKeywords(text)`: Converts text to lowercase, removes punctuation, tokenizes, and removes stop words.
- `calculateScore(keywords, docText)`: Checks for keyword matches and returns the count of unique matching tokens.
- `extractSnippet(text, matchedKeywords)`: Finds the position of matching terms and extracts a clean 250-character excerpt.
- `retrieveRelevantDocuments(question, limit)`: Ranks stored documents by score descending, breaking ties with newest creation date, and returns the top matches.

### 3. AI Service (`server/src/services/ai.service.js` & `mock-ai.service.js`)
- `callGeminiApi(question, context, apiKey, model)`: Sends a structured prompt with strict factual boundaries to the Gemini REST API.
- `generateMockAnswer(question, relevantDocs)`: Generates an offline contextual answer from matched document snippets.
- `generateAnswer(question, relevantDocs)`: Routes to Gemini when configured, automatically falling back to Mock AI on error.

---

## 📡 API Documentation (OpenAPI / Swagger)

Interactive API documentation is accessible at:
👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

### Endpoint Summary

| Method | Route | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Server health check | `200` |
| `POST` | `/api/documents` | Upload a document (`multipart/form-data`) | `201`, `400`, `413`, `500` |
| `GET` | `/api/documents` | List all documents (newest first) | `200`, `500` |
| `GET` | `/api/documents/:id` | Get document metadata by ID | `200`, `400`, `404`, `500` |
| `GET` | `/api/documents/:id/download` | Download physical file | `200`, `400`, `404`, `500` |
| `DELETE` | `/api/documents/:id` | Delete document and file | `200`, `400`, `404`, `500` |
| `POST` | `/api/chat` | Ask question over uploaded documents | `200`, `400`, `500` |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+)
- *(Optional)* **MongoDB** or **MongoDB Atlas URI** (Embedded in-memory MongoDB will auto-start if no external database is detected).

---

### 1. Environment Configuration

In `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/documind
AI_PROVIDER=mock
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

> **Note**: To use live Gemini responses, set `AI_PROVIDER=gemini` and supply your `GEMINI_API_KEY`. Otherwise, it operates in `mock` mode with zero external dependencies.

---

### 2. Start the Backend Server

```bash
cd server
npm install
npm run dev
```
Backend will be live at **`http://localhost:5000`**.

---

### 3. Start the Frontend Client

In a separate terminal window:
```bash
cd client
npm install
npm run dev
```
Frontend will be live at **`http://localhost:5173`**.

---

## 🧪 Running Automated Tests

The test suite runs using **Jest**, **Supertest**, and **MongoMemoryServer**:

```bash
cd server
npm test
```

### Verified Test Suite
```
PASS tests/documents.test.js
  ✓ 1. Successful document upload (.txt)
  ✓ 2. Unsupported file type returns 400
  ✓ 3. Missing upload returns 400
  ✓ 4. Invalid JSON upload returns 400
  ✓ 5. Document listing returns array without internal paths or text
  ✓ 6. Newest documents appear first in listing
  ✓ 7. Invalid document ID returns 400
  ✓ 8. Missing document returns 404
  ✓ 9. Document download serves the physical file
  ✓ 10 & 11. Document deletion removes file and database record

PASS tests/chat.test.js
  ✓ 12. Empty or missing chat question returns 400
  ✓ 13 & 14. Successful chat question returns answer and sources
  ✓ 15. Question with no relevant documents returns friendly message and empty sources

Test Suites: 2 passed, 2 total
Tests:       13 passed, 13 total
```

---

## 🛡 Error Handling & Reliability

- **Centralized Error Middleware**: Catches unhandled errors and normalizes all responses to `{ "message": "..." }`.
- **404 Route Catcher**: Handles undefined routes gracefully.
- **Multipart Validation**: Rejects unsupported MIME types and files > 5MB before disk storage.
- **JSON Validator**: Protects against malformed JSON uploads by parsing and deleting invalid files before saving.
- **Database Fallback**: Automatically initializes an in-memory MongoDB instance if local MongoDB is offline.
- **AI Fallback**: Automatically falls back to mock responses if external AI services fail or are misconfigured.
