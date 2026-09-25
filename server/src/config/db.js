const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/documind';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`\n========================================`);
    console.error(`MongoDB connection error: ${error.message}`);
    console.error(`Please make sure your MongoDB server is running or provide a valid MONGO_URI in server/.env`);
    console.error(`========================================\n`);
  }
};

module.exports = connectDB;
