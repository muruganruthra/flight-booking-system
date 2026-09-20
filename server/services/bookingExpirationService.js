import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import Flight from "../models/Flight.js";

/*
|--------------------------------------------------------------------------
| Expire One Pending Booking
|--------------------------------------------------------------------------
*/

const expireOneBooking = async (bookingId) => {
  const session = await mongoose.startSession();

  try {
    let result = null;

    await session.withTransaction(async () => {
      /*
      |--------------------------------------------------------------------------
      | Find booking only if it is still pending and expired
      |--------------------------------------------------------------------------
      */

      const booking = await Booking.findOne({
        _id: bookingId,
        status: "pending",
        expiresAt: { $lte: new Date() },
      }).session(session);

      /*
      |--------------------------------------------------------------------------
      | Booking may have already been paid/cancelled by another request
      |--------------------------------------------------------------------------
      */

      if (!booking) {
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Find associated flight
      |--------------------------------------------------------------------------
      */

      const flight = await Flight.findById(
        booking.flight
      ).session(session);

      if (!flight) {
        throw new Error(
          `Flight not found for booking ${booking.pnr}`
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Count seats held by this booking
      |--------------------------------------------------------------------------
      */

      const seatsToRelease =
        booking.passengers.length;

      /*
      |--------------------------------------------------------------------------
      | Mark booking as cancelled
      |--------------------------------------------------------------------------
      |
      | We use "cancelled" because the current Booking model
      | does not contain an "expired" status.
      |
      */

      booking.status = "cancelled";

      /*
      |--------------------------------------------------------------------------
      | Payment remains pending
      |--------------------------------------------------------------------------
      |
      | No payment was completed, so there is nothing to refund.
      |
      */

      booking.paymentStatus = "pending";

      await booking.save({
        session,
      });

      /*
      |--------------------------------------------------------------------------
      | Release the seats
      |--------------------------------------------------------------------------
      */

      flight.availableSeats += seatsToRelease;

      await flight.save({
        session,
      });

      result = {
        bookingId: booking._id,
        pnr: booking.pnr,
        seatsReleased: seatsToRelease,
        flightId: flight._id,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

/*
|--------------------------------------------------------------------------
| Expire All Pending Bookings
|--------------------------------------------------------------------------
*/

export const expirePendingBookings = async () => {
  try {
    const now = new Date();

    /*
    |--------------------------------------------------------------------------
    | Find all expired pending bookings
    |--------------------------------------------------------------------------
    */

    const expiredBookings = await Booking.find({
      status: "pending",
      expiresAt: {
        $lte: now,
      },
    }).select("_id pnr");

    if (expiredBookings.length === 0) {
      return {
        processed: 0,
        message: "No expired pending bookings",
      };
    }

    let processed = 0;
    let seatsReleased = 0;

    /*
    |--------------------------------------------------------------------------
    | Process each booking
    |--------------------------------------------------------------------------
    */

    for (const booking of expiredBookings) {
      try {
        const result = await expireOneBooking(
          booking._id
        );

        if (result) {
          processed++;
          seatsReleased += result.seatsReleased;

          console.log(
            `Booking expired: ${result.pnr} | ` +
            `Seats released: ${result.seatsReleased}`
          );
        }
      } catch (error) {
        console.error(
          `Failed to expire booking ${booking.pnr}:`,
          error.message
        );
      }
    }

    return {
      processed,
      seatsReleased,
    };
  } catch (error) {
    console.error(
      "BOOKING EXPIRATION ERROR:",
      error.message
    );

    return {
      processed: 0,
      seatsReleased: 0,
      error: error.message,
    };
  }
};

/*
|--------------------------------------------------------------------------
| Start Automatic Expiration Job
|--------------------------------------------------------------------------
*/

export const startBookingExpirationJob = () => {
  const INTERVAL = 60 * 1000;

  console.log(
    "Booking expiration job started."
  );

  /*
  |--------------------------------------------------------------------------
  | Run once shortly after server startup
  |--------------------------------------------------------------------------
  */

  setTimeout(() => {
    expirePendingBookings();
  }, 5000);

  /*
  |--------------------------------------------------------------------------
  | Check every 60 seconds
  |--------------------------------------------------------------------------
  */

  setInterval(() => {
    expirePendingBookings();
  }, INTERVAL);
};