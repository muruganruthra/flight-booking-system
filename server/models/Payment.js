import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    paymentMethod: {
      type: String,
      enum: [
        "card",
        "upi",
        "netbanking",
        "wallet",
      ],
      required: true,
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "success",
        "failed",
        "refunded",
      ],
      default: "pending",
    },

    paymentGateway: {
      type: String,
      default: "mock",
    },

    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    failureReason: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model(
  "Payment",
  paymentSchema
);

export default Payment;