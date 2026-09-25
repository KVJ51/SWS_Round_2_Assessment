const mongoose = require('mongoose');

let mongoMemoryServerInstance = null;

/**
 * Connects to MongoDB with automatic fallback to embedded in-memory database
 * if no external MongoDB service is reachable.
 */
const connectDB = async () => {
  const customUri = process.env.MONGO_URI;

  // 1. If explicit Atlas / remote URI provided, connect directly
  if (customUri && !customUri.includes('127.0.0.1') && !customUri.includes('localhost')) {
    try {
      const conn = await mongoose.connect(customUri);
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`Failed to connect to provided MONGO_URI: ${err.message}`);
    }
  }

  // 2. Try connecting to local MongoDB (with short timeout)
  try {
    const conn = await mongoose.connect(customUri || 'mongodb://127.0.0.1:27017/documind', {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB connected to local instance: ${conn.connection.host}`);
    return conn;
  } catch (localErr) {
    console.log(`Local MongoDB not found (${localErr.message}). Starting embedded MongoDB database...`);
  }

  // 3. Fallback: Automatically start embedded in-memory MongoDB
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    if (!mongoMemoryServerInstance) {
      mongoMemoryServerInstance = await MongoMemoryServer.create({
        binary: {
          version: '7.0.14'
        },
        instance: {
          launchTimeout: 60000,
          dbName: 'documind'
        }
      });
    }

    const embeddedUri = mongoMemoryServerInstance.getUri();
    const conn = await mongoose.connect(embeddedUri);
    console.log(`Embedded MongoDB connected successfully at ${embeddedUri}`);
    return conn;
  } catch (embeddedErr) {
    console.error(`Failed to start embedded MongoDB: ${embeddedErr.message}`);
  }
};

module.exports = connectDB;
