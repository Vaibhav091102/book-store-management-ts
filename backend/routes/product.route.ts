import express from "express";
import upload from "../middleware/uplode";

const {
  getProducts,
  createProduct,
  deleteProduct,
  updateProduct,
} = require("../controller/product.controller");

const router = express.Router();

router.get("/:id", getProducts);

router.post("/:id", upload.single("image"), createProduct);

router.delete("/delete-book/:bookId", deleteProduct);

router.put("/update/:bookId", upload.single("image"), updateProduct);

export default router;
