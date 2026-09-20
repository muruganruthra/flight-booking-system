import mongoose from "mongoose";

const aircraftSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: true,
      trim: true,
    },

    manufacturer: {
      type: String,
      required: true,
      trim: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    economySeats: {
      type: Number,
      default: 0,
      min: 0,
    },

    businessSeats: {
      type: Number,
      default: 0,
      min: 0,
    },

    firstClassSeats: {
      type: Number,
      default: 0,
      min: 0,
    },

    seatLayout: {
      type: String,
      default: "3-3",
      trim: true,
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

// Validate seat totals
aircraftSchema.pre("save", async function () {
  const classSeats =
    this.economySeats +
    this.businessSeats +
    this.firstClassSeats;

  if (classSeats > this.totalSeats) {
    throw new Error(
      "Economy, business and first-class seats cannot exceed total seats"
    );
  }
});

const Aircraft = mongoose.model(
  "Aircraft",
  aircraftSchema
);

export default Aircraft;