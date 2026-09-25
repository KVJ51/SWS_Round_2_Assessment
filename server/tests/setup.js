const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

if (typeof jest !== 'undefined') {
  jest.setTimeout(120000);
}

const connectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    return;
  }

  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '7.0.14'
      },
      instance: {
        launchTimeout: 60000,
        dbName: 'test-documind'
      }
    });
  }

  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

const closeTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    try {
      await mongoServer.stop();
      mongoServer = null;
    } catch (e) {
      // ignore
    }
  }
};

const clearTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};

module.exports = {
  connectTestDB,
  closeTestDB,
  clearTestDB
};
