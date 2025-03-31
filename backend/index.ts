import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./confic/db";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import Product from "./models/Product";
import authenticateToken from "./middleware/authMiddleware";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/product.route";
import Profile from "./routes/profile";
import { ObjectId } from "mongoose";
import path from "path";
import cartRoutes from "./routes/cartRoutes";
import { Types } from "mongoose";

interface Book {
  _id: Types.ObjectId;
  name?: string | null;
  author: string;
  price?: number | null;
  image?: string | null;
  availableCopies?: number;
  summary?: string | null;
  publisher?: string | null;
  publishedYear?: number | null;
}

// ✅ Load environment variables
dotenv.config();

if (!process.env.PORt) {
  throw new Error("PORT environment variable is not defined");
}

const app: Application = express();
const PORT = process.env.PORt || 5000;

app.get("/", (req, res) => {
  res.send("Welcome to the Home Page");
});

// ✅ Middleware

app.use(helmet());
app.use(express.json());
app.use(morgan("combined"));
// ✅ Update CORS
app.use(
  cors({
    origin: "https://book-store-management-ts-1.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposedHeaders: ["Content-Length", "X-Content-Type-Options"],
  })
);

// ✅ Add CSP Headers
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' https://book-store-management-ts.onrender.com data.onrender.com data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use("/uploads", express.static("uploads"));
// ✅ Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});
app.use(limiter);

// ✅ Connect to DB
connectDB();

// ✅ Use the Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/profile", Profile);
app.use("/api/cart", cartRoutes);

// ✅ Single Product Details
app.get(
  "/api/single-product-details/:bookId",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { bookId } = req.params;

    try {
      // 🔥 Use `.populate()` to fetch the product with the related books
      const product = await Product.findOne({ "books._id": bookId }).lean();

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
          image: book.image
            ? `https://book-store-management-ts.onrender.com/${book.image.replace(/\\/g, "/")}`
            : "https://book-store-management-ts.onrender.com/default-image.jpg", // Fallback image
        },
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching product",
      });
      next(error);
    }
  }
);

// ✅ Get All Products with Pagination
app.get(
  "/api/get-all-product",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    try {
      const products = await Product.find({}).skip(skip).limit(limit);

      if (!products) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }
      const formattedProducts = products.map((product) => ({
        ...product.toObject(),
        books: product.books.map((book: any) => ({
          ...book.toObject(),
          image: `https://book-store-management-ts.onrender.com/${book.image.replace(/\\/g, "/")}`,
        })),
      }));

      res.status(200).json({
        success: true,
        data: formattedProducts,
      });
    } catch (error) {
      console.error("Error fetching all products:", error);
      next(error);
    }
  }
);

// ✅ Improved Book Search with Pagination
app.get(
  "/api/get-books-by-search",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const searchQuery: string = (req.query.search as string)?.trim() || "";
      const page: number = parseInt(req.query.page as string) || 1;
      const limit: number = parseInt(req.query.limit as string) || 10;
      const skip: number = (page - 1) * limit;

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

      const products = await Product.find(query).skip(skip).limit(limit);

      const totalBooks = await Product.countDocuments(query);

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
    } catch (error) {
      console.error("Error fetching books:", error);
      next(error);
    }
  }
);

app.get(
  "/api/books-by-author/:authorName",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      const products = await Product.find({
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
      let booksByAuthor: Book[] = [];
      products.forEach((product) => {
        const matchingBooks = product.books.filter(
          (book) => book.author.toLowerCase() === authorName.toLowerCase()
        );
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
    } catch (error) {
      console.error("Error fetching books by author:", error);
      // In case of an error, send a 500 server error
      res.status(500).json({
        success: false,
        message: "Server error while fetching books by author.",
      });
      return;
    }
  }
);

// ✅ Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
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
