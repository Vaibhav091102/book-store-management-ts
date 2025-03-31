"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./confic/db"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const Product_1 = __importDefault(require("./models/Product"));
const authMiddleware_1 = __importDefault(require("./middleware/authMiddleware"));
// ✅ Load environment variables
dotenv_1.default.config();
if (!process.env.PORT) {
    throw new Error("PORT environment variable is not defined");
}
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// ✅ Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("combined"));
// ✅ Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
});
app.use(limiter);
// ✅ Connect to DB
(0, db_1.default)();
// ✅ Single Product Details
app.get("/api/single-product-details/:bookId", async (req, res, next) => {
    const { bookId } = req.params;
    try {
        const product = await Product_1.default.findOne({ "books._id": bookId });
        if (!product) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }
        const book = product.books.find((b) => b._id.toString() === bookId);
        if (!book) {
            res.status(404).json({ success: false, message: "Book not found" });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                ...book.toObject(),
                sellerId: product.user_id,
                productId: product._id,
            },
        });
    }
    catch (error) {
        console.error("Error fetching product:", error);
        next(error);
    }
});
// ✅ Get All Products with Pagination
app.get("/api/get-all-product", authMiddleware_1.default, async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const products = await Product_1.default.find({}).skip(skip).limit(limit);
        const totalProducts = await Product_1.default.countDocuments();
        res.status(200).json({
            success: true,
            data: products,
            total: totalProducts,
            page,
            limit,
        });
    }
    catch (error) {
        console.error("Error fetching all products:", error);
        next(error);
    }
});
// ✅ Search Books with Pagination and Safety Checks
app.get("/api/get-books-by-search", async (req, res, next) => {
    try {
        const searchQuery = req.query.search?.toString().trim() || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let books = [];
        if (searchQuery) {
            const products = await Product_1.default.find({
                $or: [
                    { "books.name": { $regex: searchQuery, $options: "i" } },
                    { "books.author": { $regex: searchQuery, $options: "i" } },
                ],
            })
                .skip(skip)
                .limit(limit);
            books = products.flatMap((product) => product.books.filter((book) => book?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ??
                (false ||
                    book?.author
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase())) ??
                false));
        }
        else {
            const products = await Product_1.default.find({}).skip(skip).limit(limit);
            books = products.flatMap((product) => product.books);
        }
        res.status(200).json({
            success: true,
            data: books,
            total: books.length,
            page,
            limit,
        });
    }
    catch (error) {
        console.error("Error fetching books:", error);
        next(error);
    }
});
// ✅ Fetch Books by Author with Proper Typing
app.get("/api/books-by-author/:authorName", async (req, res, next) => {
    try {
        const authorName = decodeURIComponent(req.params.authorName);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const products = await Product_1.default.find({ "books.author": authorName })
            .skip(skip)
            .limit(limit);
        let booksByAuthor = [];
        products.forEach((product) => {
            const matchingBooks = product.books.filter((book) => book.author === authorName);
            booksByAuthor.push(...matchingBooks);
        });
        if (booksByAuthor.length === 0) {
            res.status(404).json({
                success: false,
                message: "No books found by this author.",
            });
            return;
        }
        res.json({
            success: true,
            books: booksByAuthor,
            total: booksByAuthor.length,
            page,
            limit,
        });
    }
    catch (error) {
        console.error("Error fetching books by author:", error);
        next(error);
    }
});
// ✅ Global Error Handler
app.use((err, _req, res, _next) => {
    console.error("Unexpected error:", err);
    res.status(500).json({
        success: false,
        message: "Unexpected Server Error",
        error: err.message,
    });
});
// ✅ Start the server
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
