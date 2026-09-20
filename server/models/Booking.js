import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      enum: ["Mr", "Mrs", "Ms", "Miss", "Dr"],
      required: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    passportNumber: {
      type: String,
      trim: true,
      default: "",
    },

    nationality: {
      type: String,
      trim: true,
      default: "Indian",
    },

    seatNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    travelClass: {
      type: String,
      enum: ["economy", "business", "first"],
      required: true,
    },

    baggage: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: true }
);

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
      required: true,
    },

    pnr: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    passengers: {
      type: [passengerSchema],
      required: true,
      validate: {
        validator: function (passengers) {
          return passengers.length > 0;
        },
        message: "At least one passenger is required",
      },
    },

    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },

    baseFare: {
      type: Number,
      required: true,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    convenienceFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
      ],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "pending",
    },

    /*
     * Pending bookings temporarily hold seats.
     * After this time, the booking can be treated
     * as expired until payment is completed.
     */
    expiresAt: {
      type: Date,
      default: () =>
        new Date(Date.now() + 15 * 60 * 1000),
    },

    bookedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ flight: 1 });
bookingSchema.index({ user: 1 });
bookingSchema.index({
  "passengers.seatNumber": 1,
});

bookingSchema.index({
  expiresAt: 1,
});

const Booking = mongoose.model(
  "Booking",
  bookingSchema
);

export default Booking;