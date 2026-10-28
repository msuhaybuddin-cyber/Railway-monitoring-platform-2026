const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  // Support standard MongoDB Atlas environment variables
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (uri && !uri.includes('127.0.0.1') && !uri.includes('localhost')) {
    try {
      console.log('🔄 Connecting to MongoDB Atlas cloud database...');
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`✅ MongoDB Atlas Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.error(`❌ MongoDB Atlas connection error: ${err.message}`);
      console.warn('👉 Please verify your MongoDB Atlas setup:');
      console.warn('   1. IP Access: Ensure "0.0.0.0/0" is added under Network Access in MongoDB Atlas.');
      console.warn('   2. Database User: Ensure database username and password in MONGO_URI are correct.');
      console.warn('   3. Password Characters: If password contains special characters, ensure they are URL-encoded.');
    }
  }

  // In production (e.g. Render), only connect to MongoDB Atlas URI and avoid downloading in-memory binaries
  if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    if (!uri || uri.includes('127.0.0.1') || uri.includes('localhost')) {
      console.warn('⚠️ No cloud MONGO_URI detected in production environment.');
      console.warn('👉 Configure MONGO_URI in your Render Dashboard (Environment tab) to connect to MongoDB Atlas.');
      return null;
    }
  }

  // Attempt local MongoDB connection
  const localUri = uri || 'mongodb://127.0.0.1:27017/railway_monitoring';
  try {
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`✅ Local MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`⚠️ Could not connect to local MongoDB (${err.message})`);
    console.log('🔄 Attempting built-in in-memory MongoDB server fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      
      // Enforce a strict 4-second timeout so server never hangs if binary download is required
      const createMemoryServer = MongoMemoryServer.create({
        instance: { launchTimeout: 3500 },
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('In-memory MongoDB startup timed out (binary download skipped)')), 4000)
      );

      mongodInstance = await Promise.race([createMemoryServer, timeoutPromise]);
      const inMemoryUri = mongodInstance.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`✅ In-Memory MongoDB Connected at: ${inMemoryUri}`);

      const { seedDatabase } = require('../utils/seedData');
      await seedDatabase(false);
      return conn;
    } catch (memErr) {
      console.warn(`⚠️ In-memory database fallback unavailable: ${memErr.message}`);
      console.warn('⚡ Server will continue running in resilient mode to serve the frontend.');
      console.warn('👉 Configure MONGO_URI in your Render environment variables to connect your MongoDB Atlas database.');
      return null;
    }
  }
};

module.exports = connectDB;

