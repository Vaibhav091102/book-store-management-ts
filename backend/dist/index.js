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
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const product_route_1 = __importDefault(require("./routes/product.route"));
const profile_1 = __importDefault(require("./routes/profile"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
// ✅ Load environment variables
dotenv_1.default.config();
if (!process.env.PORt) {
    throw new Error("PORT environment variable is not defined");
}
const app = (0, express_1.default)();
const PORT = process.env.PORt || 5000;
// ✅ Middleware
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("combined"));
// ✅ Update CORS
app.use((0, cors_1.default)({
    origin: "https://book-store-management-ts-1.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposedHeaders: ["Content-Length", "X-Content-Type-Options"],
}));
// ✅ Add CSP Headers
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' https://book-store-management-ts-.onrender.com data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
});
app.use("/uploads", express_1.default.static("uploads"));
// ✅ Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
});
app.use(limiter);
// ✅ Connect to DB
(0, db_1.default)();
// ✅ Use the Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/products", product_route_1.default);
app.use("/api/profile", profile_1.default);
app.use("/api/cart", cartRoutes_1.default);
// ✅ Single Product Details
app.get("/api/single-product-details/:bookId", async (req, res, next) => {
    const { bookId } = req.params;
    try {
        // 🔥 Use `.populate()` to fetch the product with the related books
        const product = await Product_1.default.findOne({ "books._id": bookId }).lean();
        if (!product) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }
        // ✅ Find the specific book by ID
        const book = product.books.find((b) => b._id.toString() === bookId);
        if (!book) {
            res.status(404).json({ success: false, message: "Book not found" });
            return;
        }
        // ✅ Ensure proper response formatting
        res.status(200).json({
            success: true,
            data: {
                ...book,
                sellerId: product.user_id,
                productId: product._id,
                image:`https://book-store-management-ts.onrender.com/${book.image.replace(/\\/g, "/")}`
                   
            },
        });
    }
    catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching product",
        });
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
        if (!products) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }
        const formattedProducts = products.map((product) => ({
            ...product.toObject(),
            books: product.books.map((book) => ({
                ...book.toObject(),
                image: `https://book-store-management-ts.onrender.com/${book.image.replace(/\\/g, "/")}`,
            })),
        }));
        res.status(200).json({
            success: true,
            data: formattedProducts,
        });
    }
    catch (error) {
        console.error("Error fetching all products:", error);
        next(error);
    }
});
// ✅ Improved Book Search with Pagination
app.get("/api/get-books-by-search", async (req, res, next) => {
    try {
        const searchQuery = req.query.search?.trim() || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let query = {};
        if (searchQuery) {
            query = {
                books: {
                    $elemMatch: {
                        $or: [
                            { name: { $regex: searchQuery, $options: "i" } },
                            { author: { $regex: searchQuery, $options: "i" } },
                        ],
                    },
                },
            };
        }
        const products = await Product_1.default.find(query).skip(skip).limit(limit);
        const totalBooks = await Product_1.default.countDocuments(query);
        const books = products.flatMap((product) => product.books);
        if (books.length === 0) {
            res.status(404).json({
                success: false,
                message: "No books found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: books,
            page,
            limit,
            total: totalBooks,
        });
    }
    catch (error) {
        console.error("Error fetching books:", error);
        next(error);
    }
});
app.get("/api/books-by-author/:authorName", async (req, res, next) => {
    try {
        // Decode the author's name from the URL parameter
        const authorName = decodeURIComponent(req.params.authorName).trim();
        if (!authorName) {
            res.status(400).json({
                success: false,
                message: "Invalid author name provided.",
            });
            return;
        }
        // Fetch all products where the 'books' array contains this author
        const products = await Product_1.default.find({
            "books.author": authorName,
        });
        if (!products || products.length === 0) {
            res.status(404).json({
                success: false,
                message: `No books found by author: ${authorName}`,
            });
            return;
        }
        // Extract books that match the author from the products
        let booksByAuthor = [];
        products.forEach((product) => {
            const matchingBooks = product.books.filter((book) => book.author.toLowerCase() === authorName.toLowerCase());
            booksByAuthor.push(...matchingBooks);
        });
        // If no books are found, return a 404 error
        if (booksByAuthor.length === 0) {
            res.status(404).json({
                success: false,
                message: `No books found by author: ${authorName}`,
            });
            return;
        }
        // Send the list of books by the author as the response
        res.status(200).json({
            success: true,
            books: booksByAuthor,
        });
        return;
    }
    catch (error) {
        console.error("Error fetching books by author:", error);
        // In case of an error, send a 500 server error
        res.status(500).json({
            success: false,
            message: "Server error while fetching books by author.",
        });
        return;
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
