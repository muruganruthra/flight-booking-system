import crypto from "crypto";

import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";

/*
|--------------------------------------------------------------------------
| Generate Transaction ID
|--------------------------------------------------------------------------
*/

const generateTransactionId = () => {
  const randomPart = crypto
    .randomBytes(6)
    .toString("hex")
    .toUpperCase();

  return `TXN-${Date.now()}-${randomPart}`;
};

/*
|--------------------------------------------------------------------------
| Process Mock Payment
|--------------------------------------------------------------------------
|
| This is a temporary payment gateway for development/testing.
|
| In production this function will be replaced with:
|
| Razorpay / Stripe / another real payment gateway.
|
*/

export const processMockPayment = async ({
  bookingId,
  userId,
  amount,
  paymentMethod,
}) => {
  /*
   * Find booking
   */

  const booking = await Booking.findById(
    bookingId
  );

  if (!booking) {
    throw new Error("Booking not found");
  }

  /*
   * Make sure booking belongs to
   * the authenticated user.
   */

  if (
    booking.user.toString() !==
    userId.toString()
  ) {
    throw new Error(
      "You are not allowed to pay for this booking"
    );
  }

  /*
   * Booking must still be pending.
   */

  if (booking.status !== "pending") {
    throw new Error(
      `Cannot make payment for a booking with status: ${booking.status}`
    );
  }

  /*
   * Payment must still be pending.
   */

  if (
    booking.paymentStatus !== "pending"
  ) {
    throw new Error(
      `Payment cannot be processed because payment status is already ${booking.paymentStatus}`
    );
  }

  /*
   * Check booking expiration.
   */

  if (
    booking.expiresAt &&
    new Date() > booking.expiresAt
  ) {
    throw new Error(
      "Booking payment time has expired"
    );
  }

  /*
   * Validate amount.
   *
   * Never trust the amount sent from
   * the frontend/Postman.
   *
   * The booking's totalAmount is the
   * authoritative amount.
   */

  const requestedAmount = Number(amount);

  if (
    !Number.isFinite(requestedAmount) ||
    requestedAmount <= 0
  ) {
    throw new Error(
      "Valid payment amount is required"
    );
  }

  if (
    requestedAmount !==
    Number(booking.totalAmount)
  ) {
    throw new Error(
      `Payment amount must be exactly ${booking.totalAmount}`
    );
  }

  /*
   * Validate payment method.
   */

  const allowedMethods = [
    "card",
    "upi",
    "netbanking",
    "wallet",
  ];

  if (
    !allowedMethods.includes(
      paymentMethod
    )
  ) {
    throw new Error(
      "Invalid payment method"
    );
  }

  /*
   * Prevent duplicate payment.
   */

  const existingPayment =
    await Payment.findOne({
      booking: booking._id,
      status: {
        $in: [
          "pending",
          "success",
        ],
      },
    });

  if (existingPayment) {
    if (
      existingPayment.status ===
      "success"
    ) {
      throw new Error(
        "Payment has already been completed for this booking"
      );
    }

    throw new Error(
      "A payment is already being processed for this booking"
    );
  }

  /*
   * Generate transaction ID.
   */

  const transactionId =
    generateTransactionId();

  /*
   * Create pending payment.
   */

  const payment = new Payment({
    booking: booking._id,
    user: booking.user,
    amount: booking.totalAmount,
    currency: "INR",
    paymentMethod,
    transactionId,
    status: "pending",
    paymentGateway: "mock",
  });

  await payment.save();

  /*
   * Simulate successful gateway response.
   *
   * This is where a real gateway call
   * will eventually happen.
   */

  payment.status = "success";

  payment.paidAt = new Date();

  payment.gatewayResponse = {
    gateway: "mock",
    transactionId,
    message:
      "Mock payment processed successfully",
    processedAt: new Date(),
  };

  await payment.save();

  /*
   * Confirm booking.
   */

  booking.status = "confirmed";

  booking.paymentStatus = "paid";

  await booking.save();

  /*
   * Return both payment and booking.
   */

  const updatedBooking =
    await Booking.findById(
      booking._id
    )
      .populate({
        path: "flight",
        populate: [
          {
            path: "airline",
          },
          {
            path: "aircraft",
          },
          {
            path: "departureAirport",
          },
          {
            path: "arrivalAirport",
          },
        ],
      })
      .populate(
        "user",
        "name email phone"
      );

  return {
    payment,
    booking: updatedBooking,
  };
};