"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const URL = process.env.URL ||
    "mongodb+srv://tripathivaibhavmani1:iF9DD0dWAaFoXCT3@cluster0.uif4k.mongodb.net/products?retryWrites=true&w=majority&appName=Cluster0";
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
};
exports.default = connectDB;
