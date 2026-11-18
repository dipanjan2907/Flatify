import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { success } from "zod";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import propertyRoutes from "./routes/property.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/properties", propertyRoutes);

// Health Route
app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Flatify API is running" });
});

export default app;
