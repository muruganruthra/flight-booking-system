import mongoose from "mongoose";

const flightSchema = new mongoose.Schema(
  {
    flightNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    airline: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Airline",
      required: true,
    },

    aircraft: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Aircraft",
      required: true,
    },

    departureAirport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Airport",
      required: true,
    },

    arrivalAirport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Airport",
      required: true,
    },

    departureDateTime: {
      type: Date,
      required: true,
    },

    arrivalDateTime: {
      type: Date,
      required: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },

    economyPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    businessPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    firstClassPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "boarding",
        "departed",
        "arrived",
        "delayed",
        "cancelled",
      ],
      default: "scheduled",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ========================================
// VALIDATION
// ========================================

flightSchema.pre("save", async function () {
  // Departure and arrival airports cannot be the same
  if (
    this.departureAirport &&
    this.arrivalAirport &&
    this.departureAirport.toString() ===
      this.arrivalAirport.toString()
  ) {
    throw new Error(
      "Departure airport and arrival airport cannot be the same"
    );
  }

  // Arrival must be after departure
  if (
    this.departureDateTime &&
    this.arrivalDateTime &&
    this.arrivalDateTime <= this.departureDateTime
  ) {
    throw new Error(
      "Arrival date and time must be after departure date and time"
    );
  }
});

const Flight = mongoose.model("Flight", flightSchema);

export default Flight;