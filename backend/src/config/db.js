const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    if (uri && uri.trim() !== '') {
      console.log('Connecting to MongoDB via MONGODB_URI...');
      await mongoose.connect(uri);
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      return;
    }
  } catch (error) {
    console.warn(`Failed to connect to primary MONGODB_URI: ${error.message}`);
    console.warn('Attempting to launch in-memory MongoDB fallback...');
  }

  // Fallback: In-memory MongoDB Server for zero-friction local testing
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    console.log(`In-Memory MongoDB Connected at: ${mongoUri}`);
  } catch (fallbackError) {
    console.error(`MongoDB Connection Error: ${fallbackError.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
