const mongoose = require("mongoose");

let connectionPromise;

const connectDB = async () => {
  const uri = process.env.MONGO_ATLAS_URL;
  if (!uri) {
    throw new Error("MONGO_ATLAS_URL is not configured");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri);
  }

  try {
    return await connectionPromise;
  } finally {
    connectionPromise = undefined;
  }
};

module.exports = connectDB;
