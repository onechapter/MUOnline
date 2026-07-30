const mongoose = require('mongoose');

let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/muonline';

const connectDB = async (uri) => {
  mongoUri = uri || mongoUri;
  await mongoose.connect(mongoUri);
  return mongoose.connection;
};

const disconnectDB = async () => {
  await mongoose.disconnect();
};

module.exports = { connectDB, disconnectDB, mongoose };