"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const cartSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            bookId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                required: true,
            },
            productId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Product", // Reference Product to fetch book details
                required: true,
            },
            quantity: {
                type: Number,
                default: 1,
            },
        },
    ],
});
const Cart = mongoose_1.default.model("Cart", cartSchema);
exports.default = Cart;
