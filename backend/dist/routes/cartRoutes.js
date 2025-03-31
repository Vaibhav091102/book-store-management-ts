"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Cart_1 = __importDefault(require("../models/Cart"));
const router = express_1.default.Router();
// ✅ Add Item to Cart
router.post("/add", async (req, res, next) => {
    try {
        const { userId, productId, bookId, quantity } = req.body;
        if (!userId || !productId || !bookId || !quantity) {
            res
                .status(400)
                .json({ success: false, message: "All fields are required" });
            return;
        }
        let cart = await Cart_1.default.findOne({ userId });
        if (!cart) {
            cart = new Cart_1.default({ userId, items: [] });
        }
        const existingItem = cart.items.find((item) => item.bookId.toString() === bookId);
        if (existingItem) {
            existingItem.quantity += quantity;
        }
        else {
            cart.items.push({
                productId,
                bookId,
                quantity,
            });
        }
        await cart.save();
        res.status(201).json({
            success: true,
            message: "Book added to cart",
            cart,
        });
    }
    catch (error) {
        console.error("Error adding to cart:", error);
        next(error);
    }
});
// ✅ Update Cart Item Quantity
router.put("/update/:userId/:bookId", async (req, res, next) => {
    try {
        const { userId, bookId } = req.params;
        const { quantity } = req.body;
        if (!quantity || quantity < 1) {
            res.status(400).json({
                success: false,
                message: "Quantity must be at least 1",
            });
            return;
        }
        const cart = await Cart_1.default.findOne({ userId });
        if (!cart) {
            res.status(404).json({ success: false, message: "Cart not found" });
            return;
        }
        const item = cart.items.find((item) => item.bookId.toString() === bookId);
        if (!item) {
            res.status(404).json({ success: false, message: "Item not found" });
            return;
        }
        item.quantity = quantity;
        await cart.save();
        res.status(200).json({
            success: true,
            message: "Quantity updated",
            cart,
        });
    }
    catch (error) {
        console.error("Error updating cart:", error);
        next(error);
    }
});
// ✅ Get Cart by User ID with Book Details and Pagination
router.get("/:userId", async (req, res, next) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page || "1", 10);
        const limit = parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        if (!userId) {
            res
                .status(400)
                .json({ success: false, message: "User ID is required" });
            return;
        }
        const cart = await Cart_1.default.findOne({ userId }).populate({
            path: "items.bookId",
            select: "name price image author",
        });
        if (!cart) {
            res.status(404).json({ success: false, message: "Cart not found" });
            return;
        }
        const paginatedItems = cart.items.slice(skip, skip + limit);
        res.status(200).json({
            success: true,
            totalItems: cart.items.length,
            currentPage: page,
            totalPages: Math.ceil(cart.items.length / limit),
            cart: paginatedItems,
        });
    }
    catch (error) {
        console.error("Error fetching cart:", error);
        next(error);
    }
});
// ✅ Clear All Items from Cart
router.delete("/clearall/:userId", async (req, res, next) => {
    try {
        const { userId } = req.params;
        const cart = await Cart_1.default.findOneAndDelete({ userId });
        if (!cart) {
            res.status(404).json({ success: false, message: "Cart not found" });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Cart cleared",
        });
    }
    catch (error) {
        console.error("Error clearing cart:", error);
        next(error);
    }
});
// ✅ Remove Specific Item from Cart with `DocumentArray` Fix
router.delete("/clear/:userId/:bookId", async (req, res, next) => {
    try {
        const { userId, bookId } = req.params;
        const cart = await Cart_1.default.findOne({ userId });
        if (!cart) {
            res.status(404).json({ success: false, message: "Cart not found" });
            return;
        }
        const initialLength = cart.items.length;
        // ✅ Use `set()` to prevent TS2740 error
        const filteredItems = cart.items.filter((item) => item.bookId.toString() !== bookId);
        cart.set("items", filteredItems);
        if (cart.items.length === initialLength) {
            res.status(404).json({
                success: false,
                message: "Item not found in cart",
            });
            return;
        }
        await cart.save();
        res.status(200).json({
            success: true,
            message: "Item removed from cart",
            cart,
        });
    }
    catch (error) {
        console.error("Error removing item:", error);
        next(error);
    }
});
exports.default = router;
