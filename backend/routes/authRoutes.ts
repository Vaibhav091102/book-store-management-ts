import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Seller from "../models/seller";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// ✅ User Signup
router.post(
  "/signup",
  async (
    req: Request<
      {},
      {},
      {
        name: string;
        email: string;
        password: string;
        role: string;
        bookstore_name?: string;
        address?: string;
        phone?: string;
      }
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { name, email, password, role, bookstore_name, address, phone } =
      req.body;

    if (role === "seller" && !bookstore_name) {
      res
        .status(400)
        .json({ message: "Bookstore name is required for seller" });
      return;
    }

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
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

        const newSeller = new Seller({
          user_id: savedUser._id,
          bookstore_name,
          address,
          phone,
        });

        await newSeller.save();
      }

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Signup Error:", error);
      next(error);
    }
  }
);

// ✅ User Login
router.post(
  "/login",
  async (
    req: Request<{}, {}, { email: string; password: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        res.status(400).json({ message: "Invalid credentials" });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ message: "Invalid credentials" });
        return;
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      let sellerDetails = null;
      if (user.role === "seller") {
        sellerDetails = await Seller.findOne({ user_id: user._id });
      }

      res.status(200).json({ token, user, sellerDetails });
    } catch (error) {
      console.error("Login Error:", error);
      next(error);
    }
  }
);

// ✅ Forget Password
router.post(
  "/forget-password",
  async (
    req: Request<
      {},
      {},
      { email: string; newPassword: string; confirmPassword: string }
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    try {
      const user = await User.findOne({ email });

      if (!user) {
        res.status(400).json({ message: "Invalid credentials" });
        return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Forget Password Error:", error);
      next(error);
    }
  }
);

export default router;
