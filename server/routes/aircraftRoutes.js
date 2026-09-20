import express from "express";

import {
  createAircraft,
  getAircraft,
  getAircraftById,
  updateAircraft,
  deleteAircraft,
} from "../controllers/aircraftController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAircraft);
router.get("/:id", getAircraftById);

// Admin routes
router.post("/", protect, adminOnly, createAircraft);
router.put("/:id", protect, adminOnly, updateAircraft);
router.delete("/:id", protect, adminOnly, deleteAircraft);

export default router;