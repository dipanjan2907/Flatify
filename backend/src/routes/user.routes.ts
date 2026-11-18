import { Router } from "express";

import protect from "../middleware/auth.middleware.js";

import {
  getMyProfile,
  updateMyProfile,
  saveOnboarding,
} from "../controllers/user.controller.js";

const router = Router();

router.use(protect);

router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);
router.patch("/me/onboarding", saveOnboarding);

export default router;
