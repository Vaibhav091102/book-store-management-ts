import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const URL =
  process.env.URL ||
  "mongodb+srv://tripathivaibhavmani1:iF9DD0dWAaFoXCT3@cluster0.uif4k.mongodb.net/products?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error: ${(error as any).message}`);
    process.exit(1);
  }
};

export default connectDB;
