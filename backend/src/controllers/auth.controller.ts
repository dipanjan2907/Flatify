import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { signupSchema } from "../utils/auth.validation.js";
import { loginSchema } from "../utils/login.validation.js";
import { success, unknown } from "zod";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        meessage: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    const { name, email, mobile, password } = result.data;

    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message:
          existingUser.email === email
            ? "Email is already registered"
            : "Mobile number is already registered",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const secret = process.env.JWT_SECRET;

    const user = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
    });

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }
    const token = jwt.sign({ userId: user._id.toString() }, secret, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
        },
      },
    });
  } catch (error: unknown) {
    console.error("Signup error: ", error);

    // Handle MongoDB duplicate key errors and race conditions
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "Email or mobile number is already registered",
      });
      return;
    }

    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid login details",
        errors: result.error.flatten(),
      });
      return;
    }

    const { identifier, password } = result.data;
    const normalizedIdentifier = identifier.toLowerCase();

    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier }, { mobile: identifier }],
    }).select("+password");

    if (!user) {
      res
        .status(401)
        .json({ success: false, message: "Invalid email/mobile or password" });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res
        .status(401)
        .json({ success: false, message: "Invalid email/mobile or password" });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }
    const token = jwt.sign({ userId: user._id.toString() }, secret, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
        },
      },
    });
  } catch (error: unknown) {
    console.error("login error", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const signout = (_req: Request, res: Response): void => {
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: "logged out successfully" });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "user not found",
      });
      return;
    }

    if (!user) {
      res.status(404).json({
        success: false,
        message: "user not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "user fetched successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error: unknown) {
    console.error("Get user error: ", error);
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};
