import express from "express";

import {
  getAllBookings,
  adminGetBookingById,
  getBookingStatistics,
  adminCancelBooking,
} from "../controllers/adminController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| All Admin Routes Require:
| 1. Valid JWT
| 2. Admin Role
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(adminOnly);

/*
|--------------------------------------------------------------------------
| Booking Management
|--------------------------------------------------------------------------
*/

/*
GET /api/admin/bookings
*/
router.get(
  "/bookings",
  getAllBookings
);

/*
GET /api/admin/bookings/statistics
*/
router.get(
  "/bookings/statistics",
  getBookingStatistics
);

/*
GET /api/admin/bookings/:id
*/
router.get(
  "/bookings/:id",
  adminGetBookingById
);

/*
POST /api/admin/bookings/:id/cancel
*/
router.post(
  "/bookings/:id/cancel",
  adminCancelBooking
);

export default router;