import { Router } from "express";

import protect from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

import { uploadPropertyImages } from "../controllers/upload.controller.js";

const router = Router();

router.post(
  "/property-images",
  protect,
  upload.array("images", 8),
  uploadPropertyImages,
);

export default router;
