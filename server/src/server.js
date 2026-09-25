require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`DocuMind AI server running on port ${PORT}`);
  // Connect to MongoDB
  connectDB();
});
