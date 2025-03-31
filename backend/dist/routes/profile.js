"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const seller_1 = __importDefault(require("../models/seller"));
const router = express_1.default.Router();
// ✅ Get User Profile with Seller Info
router.get("/:id", async (req, res, next) => {
    const { id } = req.params;
    try {
        const user = await User_1.default.findById(id).lean();
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        let sellerInfo = null;
        if (user.role === "seller") {
            sellerInfo = await seller_1.default.findOne({ user_id: id }).lean();
        }
        res.status(200).json({
            success: true,
            user,
            sellerInfo,
        });
    }
    catch (error) {
        console.error("Error fetching profile data:", error);
        if (error.name === "CastError") {
            res.status(400).json({
                success: false,
                message: "Invalid user ID format",
            });
            return;
        }
        next(error);
    }
});
// ✅ Update User and Seller Profile
router.put("/update/:id", async (req, res, next) => {
    const { id } = req.params;
    const { name, address, phone } = req.body;
    try {
        // Update user basic information
        const updatedUser = await User_1.default.findByIdAndUpdate(id, { ...(name && { name }) }, { new: true, runValidators: true }).lean();
        if (!updatedUser) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        // If the user is a seller, update seller information
        let updatedSeller = null;
        if (updatedUser.role === "seller" && (address || phone)) {
            updatedSeller = await seller_1.default.findOneAndUpdate({ user_id: id }, { ...(address && { address }), ...(phone && { phone }) }, { new: true, runValidators: true }).lean();
        }
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
            sellerInfo: updatedSeller,
        });
    }
    catch (error) {
        console.error("Error updating profile:", error);
        if (error.name === "ValidationError") {
            res.status(400).json({
                success: false,
                message: "Invalid input data",
                error: error.message,
            });
            return;
        }
        next(error);
    }
});
exports.default = router;
