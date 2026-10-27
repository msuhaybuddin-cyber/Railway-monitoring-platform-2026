const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/railway_monitoring';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`⚠️ Could not connect to MongoDB at ${uri}: ${err.message}`);
    console.log('🔄 Starting built-in in-memory MongoDB server for instant zero-config demonstration...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongodInstance.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`✅ In-Memory MongoDB Connected at: ${inMemoryUri}`);

      // Auto-seed in-memory database so sample data is instantly available
      const { seedDatabase } = require('../utils/seedData');
      await seedDatabase(false);
      return conn;
    } catch (memErr) {
      console.error(`❌ Failed to connect to MongoDB and fallback failed:`, memErr.message);
      console.error(`👉 Please start MongoDB or provide a valid MONGO_URI in backend/.env`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
