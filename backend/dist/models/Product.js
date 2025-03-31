"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema = new mongoose_1.default.Schema({
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "seller",
        required: true,
    },
    books: [
        {
            name: {
                type: String,
                require: true,
            },
            author: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                require: true,
            },
            summary: {
                type: String,
            },
            publisher: {
                type: String,
                require: true,
            },
            publishedYear: {
                type: Number,
                require: true,
            },
            availableCopies: {
                type: Number,
                default: 1,
            },
            image: {
                type: String,
                require: true,
            },
        },
    ],
}, { timestamps: true });
const Product = mongoose_1.default.model("Product", productSchema);
exports.default = Product;
