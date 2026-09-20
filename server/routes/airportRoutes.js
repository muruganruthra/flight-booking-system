import express from "express";

import {
  getAirports,
  createAirport,
  updateAirport,
  deleteAirport,
} from "../controllers/airportController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", getAirports);

router.post(
  "/",
  protect,
  adminOnly,
  createAirport
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateAirport
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteAirport
);

export default router;