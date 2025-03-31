import { Request, Response } from "express";
import Product from "../models/Product";
import mongoose from "mongoose";

// ✅ Extend Request interface to include 'file'
interface CustomRequest extends Request {
  file?: Express.Multer.File;
}

// ✅ Retrieve all products by user ID
const getProducts = async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;

  try {
    const products = await Product.find({ user_id: id });

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No products found" });
    }

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error(
      "Error fetching products:",
      error instanceof Error ? error.message : error
    );
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Create a new product
const createProduct = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = req.body;

    let book = await Product.findOne({ user_id: id });

    if (!product.name || !product.price || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Please provide all fields including an image",
      });
    }

    if (!book) {
      book = new Product({ user_id: id, books: [] });
    }

    // Add image path to the product
    const newProduct = {
      ...product,
      image: req.file.path, // Save image path
    };

    // ✅ Use Mongoose's `push()` method safely
    (book.books as mongoose.Types.DocumentArray<any>).push(newProduct);

    await book.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error(
      "Error creating product:",
      error instanceof Error ? error.message : error
    );
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Delete a product by book ID
const deleteProduct = async (
  req: Request<{ bookId: string }>,
  res: Response
) => {
  const { bookId } = req.params;

  try {
    const product = await Product.findOne({ "books._id": bookId });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // ✅ Use Mongoose's `pull()` method for safe deletion
    (product.books as mongoose.Types.DocumentArray<any>).pull({ _id: bookId });

    if (product.books.length === 0) {
      await Product.findByIdAndDelete(product._id);
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
  } catch (error) {
    console.error(
      "Error deleting book:",
      error instanceof Error ? error.message : error
    );
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Update a product by book ID
const updateProduct = async (req: CustomRequest, res: Response) => {
  const { bookId } = req.params;
  const updatedBook = req.body;

  try {
    const product = await Product.findOne({ "books._id": bookId });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const bookIndex = product.books.findIndex(
      (b) => b._id.toString() === bookId
    );

    if (bookIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    if (req.file) {
      updatedBook.image = req.file.path; // Save new image path if uploaded
    }

    // ✅ Use Mongoose-specific document manipulation safely
    (product.books as mongoose.Types.DocumentArray<any>)[bookIndex] = {
      ...product.books[bookIndex],
      ...updatedBook,
    };

    await product.save();

    res
      .status(200)
      .json({ success: true, message: "Book updated successfully" });
  } catch (error) {
    console.error(
      "Error updating book:",
      error instanceof Error ? error.message : error
    );
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { getProducts, createProduct, deleteProduct, updateProduct };
