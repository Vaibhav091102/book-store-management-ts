"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uplode_1 = __importDefault(require("../middleware/uplode"));
const { getProducts, createProduct, deleteProduct, updateProduct, } = require("../controller/product.controller");
const router = express_1.default.Router();
router.get("/:id", getProducts);
router.post("/:id", uplode_1.default.single("image"), createProduct);
router.delete("/delete-book/:bookId", deleteProduct);
router.put("/update/:bookId", uplode_1.default.single("image"), updateProduct);
exports.default = router;
