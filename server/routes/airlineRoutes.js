import express from "express";

import {
  createAirline,
  getAirlines,
  getAirlineById,
  updateAirline,
  deleteAirline,
} from "../controllers/airlineController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public
router.get("/", getAirlines);
router.get("/:id", getAirlineById);

// Admin only
router.post("/", protect, adminOnly, createAirline);
router.put("/:id", protect, adminOnly, updateAirline);
router.delete("/:id", protect, adminOnly, deleteAirline);

export default router;