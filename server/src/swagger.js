const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'DocuMind AI API',
    version: '1.0.0',
    description: 'RESTful API for DocuMind AI — Document Management & AI-powered Q&A Assistant'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local development server'
    }
  ],
  tags: [
    { name: 'Health', description: 'System health check' },
    { name: 'Documents', description: 'Document upload, listing, retrieval, download, and deletion' },
    { name: 'Chat', description: 'AI-powered question answering over uploaded documents' }
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        description: 'Returns the health status of the API server.',
        responses: {
          '200': {
            description: 'Server is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/documents': {
      get: {
        tags: ['Documents'],
        summary: 'List all documents',
        description: 'Retrieves all uploaded documents sorted by newest first without exposing extracted text or file paths.',
        responses: {
          '200': {
            description: 'List of documents retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    documents: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string', example: '65fc1234abcd1234abcd1234' },
                          originalName: { type: 'string', example: 'annual_leave.md' },
                          mimeType: { type: 'string', example: 'text/markdown' },
                          size: { type: 'integer', example: 2048 },
                          createdAt: { type: 'string', format: 'date-time' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Failed to retrieve documents' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Documents'],
        summary: 'Upload a new document',
        description: 'Uploads a document (.txt, .md, .json) up to 5 MB and extracts text content into the database.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['document'],
                properties: {
                  document: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to upload (.txt, .md, or .json)'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Document uploaded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Document uploaded successfully' },
                    document: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string' },
                        originalName: { type: 'string' },
                        mimeType: { type: 'string' },
                        size: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid input (missing file, unsupported extension, or invalid JSON syntax)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Unsupported file extension. Only .txt, .md, and .json files are allowed.' }
                  }
                }
              }
            }
          },
          '413': {
            description: 'File too large (exceeds 5 MB limit)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'File too large. Maximum allowed size is 5 MB.' }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Server error during upload or file processing',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'An error occurred while processing the document' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/documents/{id}': {
      get: {
        tags: ['Documents'],
        summary: 'Get document details by ID',
        description: 'Retrieves metadata for a specific document by its MongoDB ObjectId.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'MongoDB Document ObjectId',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Document details retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    document: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string' },
                        originalName: { type: 'string' },
                        mimeType: { type: 'string' },
                        size: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid MongoDB ObjectId format',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Invalid document ID.' }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Document not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Document not found.' }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Failed to retrieve document' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/documents/{id}/download': {
      get: {
        tags: ['Documents'],
        summary: 'Download document file',
        description: 'Downloads the physical document file preserving its original filename.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'MongoDB Document ObjectId',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'File downloaded successfully',
            content: {
              'application/octet-stream': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          },
          '400': {
            description: 'Invalid document ID format',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Invalid document ID.' }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Document or physical file not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Document not found.' }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Download streaming error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Error downloading the file' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/documents/{id}': {
      delete: {
        tags: ['Documents'],
        summary: 'Delete document',
        description: 'Deletes the document entry from MongoDB and its physical file from the server uploads directory.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'MongoDB Document ObjectId',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Document deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Document and associated file deleted successfully.' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid document ID format',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Invalid document ID.' }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Document not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Document not found.' }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Server error during deletion',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Failed to delete document' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/chat': {
      post: {
        tags: ['Chat'],
        summary: 'Ask a question based on uploaded documents',
        description: 'Finds the top 3 relevant documents using keyword-overlap scoring and generates an AI answer based on their snippets.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['question'],
                properties: {
                  question: {
                    type: 'string',
                    example: 'What is the employee annual leave policy?'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'AI answer and sources returned successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    answer: {
                      type: 'string',
                      example: 'Employees are entitled to 24 days of annual leave per year.'
                    },
                    sources: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string', example: '65fc1234abcd1234abcd1234' },
                          originalName: { type: 'string', example: 'hr_policy.md' },
                          score: { type: 'integer', example: 4 }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Question missing or empty',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Question is required and cannot be empty.' }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Failed to generate answer',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Failed to generate answer' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = {
  setupSwagger,
  swaggerDocument
};
