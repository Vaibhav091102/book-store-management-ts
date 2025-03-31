"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProduct = exports.deleteProduct = exports.createProduct = exports.getProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
// ✅ Retrieve all products by user ID
const getProducts = async (req, res) => {
    const { id } = req.params;
    try {
        const products = await Product_1.default.find({ user_id: id });
        if (!products || products.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "No products found" });
        }
        res.status(200).json({ success: true, data: products });
    }
    catch (error) {
        console.error("Error fetching products:", error instanceof Error ? error.message : error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
exports.getProducts = getProducts;
// ✅ Create a new product
const createProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = req.body;
        let book = await Product_1.default.findOne({ user_id: id });
        if (!product.name || !product.price || !req.file) {
            return res.status(400).json({
                success: false,
                message: "Please provide all fields including an image",
            });
        }
        if (!book) {
            book = new Product_1.default({ user_id: id, books: [] });
        }
        // Add image path to the product
        const newProduct = {
            ...product,
            image: req.file.path, // Save image path
        };
        // ✅ Use Mongoose's `push()` method safely
        book.books.push(newProduct);
        await book.save();
        res.status(201).json({ success: true, data: newProduct });
    }
    catch (error) {
        console.error("Error creating product:", error instanceof Error ? error.message : error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
exports.createProduct = createProduct;
// ✅ Delete a product by book ID
const deleteProduct = async (req, res) => {
    const { bookId } = req.params;
    try {
        const product = await Product_1.default.findOne({ "books._id": bookId });
        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });
        }
        // ✅ Use Mongoose's `pull()` method for safe deletion
        product.books.pull({ _id: bookId });
        if (product.books.length === 0) {
            await Product_1.default.findByIdAndDelete(product._id);
            return res.status(200).json({
                success: true,
                message: "Book deleted, and product removed as no books remain",
            });
        }
        await product.save();
        res.status(200).json({
            success: true,
            message: "Book deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting book:", error instanceof Error ? error.message : error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
exports.deleteProduct = deleteProduct;
// ✅ Update a product by book ID
const updateProduct = async (req, res) => {
    const { bookId } = req.params;
    const updatedBook = req.body;
    try {
        const product = await Product_1.default.findOne({ "books._id": bookId });
        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });
        }
        const bookIndex = product.books.findIndex((b) => b._id.toString() === bookId);
        if (bookIndex === -1) {
            return res
                .status(404)
                .json({ success: false, message: "Book not found" });
        }
        if (req.file) {
            updatedBook.image = req.file.path; // Save new image path if uploaded
        }
        // ✅ Use Mongoose-specific document manipulation safely
        product.books[bookIndex] = {
            ...product.books[bookIndex],
            ...updatedBook,
        };
        await product.save();
        res
            .status(200)
            .json({ success: true, message: "Book updated successfully" });
    }
    catch (error) {
        console.error("Error updating book:", error instanceof Error ? error.message : error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
exports.updateProduct = updateProduct;
