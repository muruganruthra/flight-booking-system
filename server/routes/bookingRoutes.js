import express from "express";

import {
  createBooking,
  getAvailableSeats,
  getMyBookings,
  getBookingById,
  generateTicket,
  downloadTicket,
  sendTicketByEmail,
  cancelBooking,
} from "../controllers/bookingController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Booking routes
|--------------------------------------------------------------------------
*/

/*
 * Check available seats
 *
 * GET /api/bookings/seats/:flightId
 */
router.get(
  "/seats/:flightId",
  protect,
  getAvailableSeats
);

/*
 * Create booking
 *
 * POST /api/bookings
 */
router.post(
  "/",
  protect,
  createBooking
);

/*
 * Get logged-in user's bookings
 *
 * GET /api/bookings/my-bookings
 */
router.get(
  "/my-bookings",
  protect,
  getMyBookings
);

/*
 * Generate ticket
 *
 * POST /api/bookings/:id/ticket
 */
router.post(
  "/:id/ticket",
  protect,
  generateTicket
);

/*
 * Download ticket
 *
 * GET /api/bookings/:id/ticket
 */
router.get(
  "/:id/ticket",
  protect,
  downloadTicket
);

/*
 * Send ticket by email
 *
 * POST /api/bookings/:id/email-ticket
 */
router.post(
  "/:id/email-ticket",
  protect,
  sendTicketByEmail
);

/*
 * Cancel booking and refund payment
 *
 * POST /api/bookings/:id/cancel
 */
router.post(
  "/:id/cancel",
  protect,
  cancelBooking
);

/*
 * Get single booking
 *
 * IMPORTANT:
 * This must remain after the specific /:id/... routes.
 */
router.get(
  "/:id",
  protect,
  getBookingById
);

export default router;