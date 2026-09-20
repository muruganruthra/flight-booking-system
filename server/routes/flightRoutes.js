import express from "express";

import {
  createFlight,
  getFlights,
  searchFlights,
  getFlightById,
  updateFlight,
  deleteFlight,
} from "../controllers/flightController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// ========================================
// PUBLIC ROUTES
// ========================================

// Search flights
router.get("/search", searchFlights);

// Get all flights
router.get("/", getFlights);

// Get single flight
router.get("/:id", getFlightById);

// ========================================
// ADMIN ROUTES
// ========================================

// Create flight
router.post(
  "/",
  protect,
  adminOnly,
  createFlight
);

// Update flight
router.put(
  "/:id",
  protect,
  adminOnly,
  updateFlight
);

// Delete flight
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteFlight
);

export default router;