import {
  signup,
  signin,
  signout,
  getMe,
} from "../controllers/auth.controller.js";
import { Router } from "express";
import protect from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signin", signin);
router.post("/signup", signup);
router.post("/signout", signout);
router.get("/me", protect, getMe);

export default router;
