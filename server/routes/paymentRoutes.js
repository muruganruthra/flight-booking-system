import express from "express";

import {
  createPayment,
  getMyPayments,
  getPaymentById,
} from "../controllers/paymentController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Payment routes
|--------------------------------------------------------------------------
*/

/*
 * Create payment
 *
 * POST /api/payments
 */
router.post(
  "/",
  protect,
  createPayment
);

/*
 * Get logged-in user's payments
 *
 * IMPORTANT:
 * This must come before /:id
 */
router.get(
  "/my-payments",
  protect,
  getMyPayments
);

/*
 * Get a single payment
 *
 * GET /api/payments/:id
 */
router.get(
  "/:id",
  protect,
  getPaymentById
);

export default router;