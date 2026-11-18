import { Router } from "express";

import protect from "../middleware/auth.middleware.js";

import {
  createProperty,
  getProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  updatePropertyStatus,
  deleteProperty,
} from "../controllers/property.controller.js";

const router = Router();

// Public routes
router.get("/", getProperties);

// Authenticated routes
router.get("/mine", protect, getMyProperties);
router.post("/", protect, createProperty);
router.patch("/:id/status", protect, updatePropertyStatus);
router.patch("/:id", protect, updateProperty);
router.delete("/:id", protect, deleteProperty);

// Public property details
router.get("/:id", getPropertyById);

export default router;
