import type { Request, Response } from "express";
import { toFile } from "@imagekit/nodejs";

import getImageKit from "../config/imagekit.js";

export const uploadPropertyImages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const uploadedImages: {
    fileId: string;
    url: string;
    filePath: string;
  }[] = [];

  try {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: "Please select at least one image",
      });
      return;
    }

    const userId = (req as Request & { user?: { userId?: string } }).user
      ?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const imagekit = getImageKit();

    for (const file of files) {
      const response = await imagekit.files.upload({
        file: await toFile(file.buffer, file.originalname),
        fileName: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
        folder: `/flatify/properties/${userId}`,
        tags: ["flatify", "property"],
        useUniqueFileName: true,
      });

      if (!response.fileId) {
        throw new Error("Image upload response did not include a file ID");
      }
      if (!response.url) {
        throw new Error("Image upload response did not include a URL");
      }
      if (!response.filePath) {
        throw new Error("Image upload response did not include a file path");
      }

      uploadedImages.push({
        fileId: response.fileId,
        url: response.url,
        filePath: response.filePath,
      });
    }

    res.status(201).json({
      success: true,
      message: "Images uploaded successfully",
      data: {
        images: uploadedImages,
      },
    });
  } catch (error: unknown) {
    console.error("Image upload error:", error);

    // Roll back successfully uploaded images if a later upload fails.
    const imagekit = getImageKit();

    await Promise.allSettled(
      uploadedImages.map((image) => imagekit.files.delete(image.fileId)),
    );

    res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
};
