"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const seller_1 = __importDefault(require("../models/seller"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
// ✅ User Signup
router.post("/signup", async (req, res, next) => {
    const { name, email, password, role, bookstore_name, address, phone } = req.body;
    if (role === "seller" && !bookstore_name) {
        res
            .status(400)
            .json({ message: "Bookstore name is required for seller" });
        return;
    }
    try {
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = new User_1.default({
            name,
            email,
            password: hashedPassword,
            role,
        });
        const savedUser = await newUser.save();
        if (role === "seller") {
            if (!bookstore_name || !address || !phone) {
                res.status(400).json({ message: "Seller details are required" });
                return;
            }
            const newSeller = new seller_1.default({
                user_id: savedUser._id,
                bookstore_name,
                address,
                phone,
            });
            await newSeller.save();
        }
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        console.error("Signup Error:", error);
        next(error);
    }
});
// ✅ User Login
router.post("/login", async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        let sellerDetails = null;
        if (user.role === "seller") {
            sellerDetails = await seller_1.default.findOne({ user_id: user._id });
        }
        res.status(200).json({ token, user, sellerDetails });
    }
    catch (error) {
        console.error("Login Error:", error);
        next(error);
    }
});
// ✅ Forget Password
router.post("/forget-password", async (req, res, next) => {
    const { email, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
        res.status(400).json({ message: "Passwords do not match" });
        return;
    }
    try {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) {
        console.error("Forget Password Error:", error);
        next(error);
    }
});
exports.default = router;
