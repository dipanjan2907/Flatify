import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { success } from "zod";
interface AuthTokenPayload extends JwtPayload {
  userId: string;
}

const protect = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
      return;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured.");
    }
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === "string" || typeof decoded.userId !== "string") {
      res
        .status(401)
        .json({ success: false, message: "Invalid authentication token" });
      return;
    }
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "invalid or expired token. Please login again.",
    });
  }
};

export default protect;
