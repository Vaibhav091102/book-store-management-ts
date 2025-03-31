"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
// ✅ Environment-based upload directory
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
// ✅ Multer storage configuration
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR); // Use environment variable for upload path
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
// ✅ File filter with proper TypeScript typing
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Accept the file
    }
    else {
        const error = new Error("Invalid file type. Only JPEG, PNG, and WEBP are allowed.");
        cb(error); // Cast error to match multer's expected type
    }
};
// ✅ Multer configuration with size limit and error handling
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter,
});
exports.default = upload;
