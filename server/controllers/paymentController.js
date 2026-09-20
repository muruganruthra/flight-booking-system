import mongoose from "mongoose";

import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import { processMockPayment } from "../services/paymentService.js";

/*
|--------------------------------------------------------------------------
| Create Payment
|--------------------------------------------------------------------------
*/
export const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;

    /*
     * Validate booking ID
     */
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Valid bookingId is required",
      });
    }

    /*
     * Validate payment method
     */
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    /*
     * Find booking
     */
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    /*
     * Make sure the booking belongs
     * to the logged-in user
     */
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to pay for this booking",
      });
    }

    /*
     * Process mock payment
     */
    const result = await processMockPayment({
      bookingId,
      userId: req.user._id,
      amount,
      paymentMethod,
    });

    return res.status(201).json({
      success: true,
      message: "Payment successful and booking confirmed",
      payment: result.payment,
      booking: result.booking,
    });
  } catch (error) {
    console.error("CREATE PAYMENT ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Payment failed",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get My Payments
|--------------------------------------------------------------------------
*/
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user._id,
    })
      .populate({
        path: "booking",
        select:
          "pnr passengers totalAmount status paymentStatus contactEmail contactPhone",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("GET MY PAYMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Payment By ID
|--------------------------------------------------------------------------
*/
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    /*
     * Validate payment ID
     */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    /*
     * Find payment
     */
    const payment = await Payment.findById(id).populate({
      path: "booking",
      populate: {
        path: "flight",
        populate: [
          {
            path: "airline",
          },
          {
            path: "departureAirport",
          },
          {
            path: "arrivalAirport",
          },
        ],
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    /*
     * Only payment owner can view it
     */
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this payment",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("GET PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
    });
  }
};