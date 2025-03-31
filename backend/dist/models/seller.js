"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const sellerSchema = new mongoose_1.default.Schema({
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }, // Reference to User model
    bookstore_name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
}, { timestamps: true });
const Seller = mongoose_1.default.model("Seller", sellerSchema);
exports.default = Seller;
