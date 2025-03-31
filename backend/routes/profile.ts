import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import User from "../models/User";
import Seller from "../models/seller";

const router = express.Router();

// ✅ Get User Profile with Seller Info
router.get(
  "/:id",
  async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { id } = req.params;

    try {
      const user = await User.findById(id).lean();
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      let sellerInfo = null;
      if (user.role === "seller") {
        sellerInfo = await Seller.findOne({ user_id: id }).lean();
      }

      res.status(200).json({
        success: true,
        user,
        sellerInfo,
      });
    } catch (error: any) {
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
  }
);

// ✅ Update User and Seller Profile
router.put(
  "/update/:id",
  async (
    req: Request<
      { id: string },
      {},
      { name?: string; address?: string; phone?: string }
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { id } = req.params;
    const { name, address, phone } = req.body;

    try {
      // Update user basic information
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { ...(name && { name }) },
        { new: true, runValidators: true }
      ).lean();

      if (!updatedUser) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      // If the user is a seller, update seller information
      let updatedSeller = null;
      if (updatedUser.role === "seller" && (address || phone)) {
        updatedSeller = await Seller.findOneAndUpdate(
          { user_id: id },
          { ...(address && { address }), ...(phone && { phone }) },
          { new: true, runValidators: true }
        ).lean();
      }

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
        sellerInfo: updatedSeller,
      });
    } catch (error: any) {
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
  }
);

export default router;
