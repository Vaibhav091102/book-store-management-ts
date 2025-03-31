"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Ensure environment variables are loaded
const authenticateToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Access Denied! No Token Provided" });
        return;
    }
    try {
        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            throw new Error("JWT_SECRET is missing");
        }
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        req.user = decoded; // Attach decoded token to request
        next();
    }
    catch (error) {
        console.error("Token verification error:", error);
        res.status(403).json({ message: "Invalid Token" });
    }
};
exports.default = authenticateToken;
