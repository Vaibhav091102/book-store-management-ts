import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config(); // Ensure environment variables are loaded

// Extended request type to include `user`
interface AuthRequest extends Request {
  user?: any; // Add `user` property
}

const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access Denied! No Token Provided" });
    return;
  }

  try {
    const secretKey = process.env.JWT_SECRET as string;

    if (!secretKey) {
      throw new Error("JWT_SECRET is missing");
    }

    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Attach decoded token to request
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(403).json({ message: "Invalid Token" });
  }
};

export default authenticateToken;
