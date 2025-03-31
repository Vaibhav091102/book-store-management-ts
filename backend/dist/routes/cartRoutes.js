"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Cart_1 = __importDefault(require("../models/Cart"));
const Product_1 = __importDefault(require("../models/Product"));
const mongoose_1 = require("mongoose");
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
        // 🔥 Convert IDs to MongoDB ObjectId
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        const productObjectId = new mongoose_1.Types.ObjectId(productId);
        const bookObjectId = new mongoose_1.Types.ObjectId(bookId);
        // ✅ Check if cart exists
        let cart = await Cart_1.default.findOne({ userId: userObjectId });
        if (!cart) {
            cart = new Cart_1.default({ userId: userObjectId, items: [] });
        }
        // ✅ Find existing item
        const existingItem = cart.items.find((item) => item.bookId.equals(bookObjectId));
        if (existingItem) {
            existingItem.quantity += quantity;
        }
        else {
            cart.items.push({
                productId: productObjectId,
                bookId: bookObjectId,
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
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        const bookObjectId = new mongoose_1.Types.ObjectId(bookId);
        const cart = await Cart_1.default.findOne({ userId: userObjectId });
        if (!cart) {
            res.status(404).json({ success: false, message: "Cart not found" });
            return;
        }
        const item = cart.items.find((item) => item.bookId.equals(bookObjectId));
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
// ✅ Get Cart by User ID with Pagination and Book Details
// ✅ Get Cart with Book Details by User ID
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: "User ID is required" });
            return;
        }
        const userObjectId = new mongoose_1.Types.ObjectId(id);
        // ✅ Find the user's cart
        const cart = await Cart_1.default.findOne({ userId: userObjectId });
        if (!cart) {
            res.status(404).json({ message: "Cart not found" });
            return;
        }
        // ✅ Extract book IDs from cart items
        const bookIds = cart.items.map((item) => item.bookId);
        // ✅ Find all products containing these books in a single query
        const products = await Product_1.default.find({ "books._id": { $in: bookIds } });
        // ✅ Map cart items with book details
        const cartWithBooks = cart.items
            .map((item) => {
            const product = products.find((p) => p.books.some((b) => b._id.equals(item.bookId)));
            if (!product)
                return null;
            const bookDetails = product.books.find((b) => b._id.equals(item.bookId));
            return {
                ...item.toObject(),
                book: bookDetails || null, // Ensure bookDetails is not undefined
            };
        })
            .filter((item) => item !== null); // Remove null values
        res.status(200).json({ cart: cartWithBooks });
        return;
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
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        const cart = await Cart_1.default.findOneAndDelete({ userId: userObjectId });
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
// ✅ Remove Specific Item from Cart
router.delete("/clear/:userId/:bookId", async (req, res, next) => {
    try {
        const { userId, bookId } = req.params;
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        const bookObjectId = new mongoose_1.Types.ObjectId(bookId);
        const cart = await Cart_1.default.findOne({ userId: userObjectId });
        if (!cart) {
            res.status(404).json({ success: false, message: "Cart not found" });
            return;
        }
        const initialLength = cart.items.length;
        cart.items = cart.items.filter((item) => !item.bookId.equals(bookObjectId));
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
