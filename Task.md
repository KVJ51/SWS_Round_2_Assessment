To build a simple RAG application 
with the tech stacks of MERN with AI integrated to it 
The output are architecture are:
            Upload Document → Store & Extract Content → Retrieve Documents → Ask Question → Find Relevant Content → Generate Answer → Return Sources
Allow mock answers too 
the folder structure is:
 documind-ai/
│
├── server/
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── document.controller.js
│   │   │   └── chat.controller.js
│   │   │
│   │   ├── models/
│   │   │   └── Document.js
│   │   │
│   │   ├── routes/
│   │   │   ├── document.routes.js
│   │   │   └── chat.routes.js
│   │   │
│   │   ├── services/
│   │   │   ├── file.service.js
│   │   │   ├── retrieval.service.js
│   │   │   ├── ai.service.js
│   │   │   └── mock-ai.service.js
│   │   │
│   │   ├── middleware/
│   │   │   └── error.middleware.js
│   │   │
│   │   ├── utils/
│   │   │   └── text.utils.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── uploads/
│   │
│   ├── tests/
│   │   ├── documents.test.js
│   │   └── chat.test.js
│   │
│   ├── swagger.yaml
│   ├── .env
│   └── package.json
│
├── client/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── UploadZone.jsx
│   │   │   ├── DocumentCard.jsx
│   │   │   ├── DocumentList.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   └── SourceCard.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Assistant.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── README.md
└── .gitignore