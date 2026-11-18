import type { Request, Response } from "express";
import mongoose from "mongoose";

import Property from "../models/Property.js";
import type { IProperty, IPropertyImage } from "../models/Property.js";
import {
  createPropertySchema,
  updatePropertySchema,
  propertyStatusSchema,
} from "../utils/property.validation.js";

import {
  verifyImageOwnership,
  deleteUnusedImages,
} from "../services/propertyImage.service.js";

export const createProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = createPropertySchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid property details",
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    const userId = (req as Request & { user: { userId: string } }).user.userId;
    const { images, ...propertyData } = result.data;

    if (!verifyImageOwnership(images, userId)) {
      res.status(403).json({
        success: false,
        message: "One or more images do not belong to you",
      });
      return;
    }

    const property = await Property.create({
      ...propertyData,
      images,
      owner: userId,
    });

    res.status(201).json({
      success: true,
      message: "Property listed successfully",
      data: { property },
    });
  } catch (error: unknown) {
    console.error("Create property error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create property",
    });
  }
};

export const getProperties = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      city,
      locality,
      minRent,
      maxRent,
      propertyType,
      listingType,
      furnishing,
      bedrooms,
      amenities,
      sort = "newest",
      page = "1",
      limit = "12",
    } = req.query;

    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 12));

    const filter: mongoose.QueryFilter<IProperty> = {
      status: "active",
    };

    if (typeof city === "string") {
      filter["location.city"] = {
        $regex: city.trim(),
        $options: "i",
      };
    }

    if (typeof locality === "string") {
      filter["location.locality"] = {
        $regex: locality.trim(),
        $options: "i",
      };
    }

    if (minRent || maxRent) {
      filter.rent = {};

      if (minRent) {
        filter.rent.$gte = Math.max(0, Number(minRent));
      }

      if (maxRent) {
        filter.rent.$lte = Math.max(0, Number(maxRent));
      }
    }

    if (typeof propertyType === "string") {
      filter.propertyType = propertyType;
    }

    if (typeof listingType === "string") {
      filter.listingType = listingType;
    }

    if (typeof furnishing === "string") {
      filter.furnishing = furnishing;
    }

    if (bedrooms !== undefined) {
      filter.bedrooms = Number(bedrooms);
    }

    if (typeof amenities === "string") {
      filter.amenities = {
        $all: amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };
    }

    const sortOptions: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      "rent-low": { rent: 1 },
      "rent-high": { rent: -1 },
    };

    const sortBy = sortOptions[String(sort)] ?? sortOptions.newest;

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate("owner", "name profilePicture")
        .sort(sortBy)
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      Property.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "Properties fetched successfully",
      data: { properties },
      pagination: {
        page: currentPage,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: currentPage * pageSize < total,
        hasPrevPage: currentPage > 1,
      },
    });
  } catch (error: unknown) {
    console.error("Get properties error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
    });
  }
};

export const getPropertyById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id)
      .where("status")
      .equals("active")
      .populate("owner", "name profilePicture occupation");

    if (!property) {
      res.status(404).json({
        success: false,
        message: "Property not found or unavailable",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { property },
    });
  } catch (error: unknown) {
    console.error("Get property error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch property",
    });
  }
};

export const getMyProperties = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as Request & { user: { userId: string } }).user.userId;

    const properties = await Property.find({
      owner: userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { properties },
    });
  } catch (error: unknown) {
    console.error("Get my properties error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your listings",
    });
  }
};

export const updateProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = updatePropertySchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid property details",
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    const userId = req.user!.userId;

    const property = await Property.findOne({
      _id: req.params.id,
      owner: userId,
    });

    if (!property) {
      res.status(404).json({
        success: false,
        message: "Property not found or you are not the owner",
      });
      return;
    }

    const updatedData = result.data;

    if (
      updatedData.images &&
      !verifyImageOwnership(updatedData.images, userId)
    ) {
      res.status(403).json({
        success: false,
        message: "One or more images do not belong to you",
      });
      return;
    }

    const oldImages = property.images;

    Object.assign(property, updatedData);

    await property.save();

    if (updatedData.images) {
      const retainedIds = new Set(
        updatedData.images.map((image) => image.fileId),
      );

      const removedImages = oldImages.filter(
        (image) => !retainedIds.has(image.fileId),
      );

      await deleteUnusedImages(removedImages, property._id.toString());
    }

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: { property },
    });
  } catch (error: unknown) {
    console.error("Update property error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update property",
    });
  }
};

export const updatePropertyStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = propertyStatusSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid listing status",
      });
      return;
    }

    const property = await Property.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user!.userId,
      },
      {
        $set: { status: result.data.status },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!property) {
      res.status(404).json({
        success: false,
        message: "Property not found or you are not the owner",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Listing marked as ${property.status}`,
      data: { property },
    });
  } catch (error: unknown) {
    console.error("Update status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update listing status",
    });
  }
};

export const deleteProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const property = await Property.findOneAndDelete({
      _id: req.params.id,
      owner: req.user!.userId,
    });

    if (!property) {
      res.status(404).json({
        success: false,
        message: "Property not found or you are not the owner",
      });
      return;
    }

    await deleteUnusedImages(property.images, property._id.toString());

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete property error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete property",
    });
  }
};
