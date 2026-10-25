import mongoose from 'mongoose';

let memoryServerInstance = null;

export const connectDB = async (customUri) => {
  const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campushire';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Failed to connect to ${uri}: ${error.message}`);
    
    // Fallback in development or test if local mongo is down
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[Database] Initializing fallback in-memory MongoDB server...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const memUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[Database] Connected to fallback In-Memory MongoDB: ${memUri}`);
        return conn;
      } catch (fallbackError) {
        console.error('[Database] In-memory fallback failed:', fallbackError.message);
        throw error;
      }
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
      memoryServerInstance = null;
    }
    console.log('[Database] MongoDB disconnected cleanly');
  } catch (err) {
    console.error('[Database] Error during disconnect:', err.message);
  }
};
