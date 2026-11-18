import type { Request, Response } from "express";

import User from "../models/User.js";
import {
  profileSchema,
  onboardingSchema,
} from "../utils/profile.validation.js";

export const getMyProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          profilePicture: user.profilePicture,
          age: user.age,
          occupation: user.occupation,
          bio: user.bio,
          intents: user.intents,
          preferences: user.preferences,
          onboardingCompleted: user.onboardingCompleted,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error: unknown) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateMyProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = profileSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid profile data",
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    const userId = req.user?.userId;

    if (result.data.mobile) {
      const existingMobile = await User.findOne({
        mobile: result.data.mobile,
        _id: { $ne: userId },
      } as any);

      if (existingMobile) {
        res.status(409).json({
          success: false,
          message: "Mobile number is already in use",
        });
        return;
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: result.data },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          profilePicture: user.profilePicture,
          age: user.age,
          occupation: user.occupation,
          bio: user.bio,
        },
      },
    });
  } catch (error: unknown) {
    console.error("Update profile error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// SAVE ONBOARDING
export const saveOnboarding = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = onboardingSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid onboarding data",
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    const { intents, preferences } = result.data;

    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      {
        $set: {
          intents,
          preferences,
          onboardingCompleted: true,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      data: {
        intents: user.intents,
        preferences: user.preferences,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error: unknown) {
    console.error("Onboarding error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
