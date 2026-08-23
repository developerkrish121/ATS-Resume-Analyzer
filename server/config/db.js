const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected.");
    return conn;
  } catch (error) {
    throw new Error("Unable to connect to MongoDB.", { cause: error });
  }
};

module.exports = connectDB;
