import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import Flight from "../models/Flight.js";
import Payment from "../models/Payment.js";

/*
|--------------------------------------------------------------------------
| Get All Bookings - Admin
|--------------------------------------------------------------------------
*/

export const getAllBookings = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      pnr,
      flightId,
      userId,
    } = req.query;

    const filter = {};

    /*
    |--------------------------------------------------------------------------
    | Filter by booking status
    |--------------------------------------------------------------------------
    */

    if (status) {
      filter.status = status;
    }

    /*
    |--------------------------------------------------------------------------
    | Filter by payment status
    |--------------------------------------------------------------------------
    */

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    /*
    |--------------------------------------------------------------------------
    | Filter by PNR
    |--------------------------------------------------------------------------
    */

    if (pnr) {
      filter.pnr = pnr.toUpperCase().trim();
    }

    /*
    |--------------------------------------------------------------------------
    | Filter by flight
    |--------------------------------------------------------------------------
    */

    if (flightId) {
      if (!mongoose.Types.ObjectId.isValid(flightId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid flight ID",
        });
      }

      filter.flight = flightId;
    }

    /*
    |--------------------------------------------------------------------------
    | Filter by user
    |--------------------------------------------------------------------------
    */

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      filter.user = userId;
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch bookings
    |--------------------------------------------------------------------------
    */

    const bookings = await Booking.find(filter)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
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
          {
            path: "aircraft",
          },
        ],
      })
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(
      "ADMIN GET ALL BOOKINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Booking By ID - Admin
|--------------------------------------------------------------------------
*/

export const adminGetBookingById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(id)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
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
          {
            path: "aircraft",
          },
        ],
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find payment
    |--------------------------------------------------------------------------
    */

    const payment = await Payment.findOne({
      booking: booking._id,
    });

    return res.status(200).json({
      success: true,
      booking,
      payment,
    });
  } catch (error) {
    console.error(
      "ADMIN GET BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Booking Statistics - Admin
|--------------------------------------------------------------------------
*/

export const getBookingStatistics = async (
  req,
  res
) => {
  try {
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      paidBookings,
      refundedBookings,
    ] = await Promise.all([
      Booking.countDocuments(),

      Booking.countDocuments({
        status: "pending",
      }),

      Booking.countDocuments({
        status: "confirmed",
      }),

      Booking.countDocuments({
        status: "cancelled",
      }),

      Booking.countDocuments({
        status: "completed",
      }),

      Booking.countDocuments({
        paymentStatus: "paid",
      }),

      Booking.countDocuments({
        paymentStatus: "refunded",
      }),
    ]);

    /*
    |--------------------------------------------------------------------------
    | Revenue
    |--------------------------------------------------------------------------
    */

    const revenueResult =
      await Booking.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$totalAmount",
            },
          },
        },
      ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    /*
    |--------------------------------------------------------------------------
    | Refund amount
    |--------------------------------------------------------------------------
    */

    const refundResult =
      await Payment.aggregate([
        {
          $match: {
            status: "refunded",
          },
        },
        {
          $group: {
            _id: null,
            totalRefunded: {
              $sum: "$refundAmount",
            },
          },
        },
      ]);

    const totalRefunded =
      refundResult.length > 0
        ? refundResult[0].totalRefunded
        : 0;

    return res.status(200).json({
      success: true,
      statistics: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        paidBookings,
        refundedBookings,
        totalRevenue,
        totalRefunded,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN BOOKING STATISTICS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch booking statistics",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Cancel Booking - Admin
|--------------------------------------------------------------------------
*/

export const adminCancelBooking = async (
  req,
  res
) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    let cancellationResult;

    await session.withTransaction(async () => {
      /*
      |--------------------------------------------------------------------------
      | Find booking
      |--------------------------------------------------------------------------
      */

      const booking =
        await Booking.findById(id).session(
          session
        );

      if (!booking) {
        throw new Error(
          "Booking not found"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Check booking status
      |--------------------------------------------------------------------------
      */

      if (booking.status === "cancelled") {
        throw new Error(
          "Booking is already cancelled"
        );
      }

      if (booking.status === "completed") {
        throw new Error(
          "Completed booking cannot be cancelled"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Find flight
      |--------------------------------------------------------------------------
      */

      const flight =
        await Flight.findById(
          booking.flight
        ).session(session);

      if (!flight) {
        throw new Error(
          "Associated flight not found"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Count seats
      |--------------------------------------------------------------------------
      */

      const passengerCount =
        booking.passengers.length;

      /*
      |--------------------------------------------------------------------------
      | Find payment
      |--------------------------------------------------------------------------
      */

      const payment =
        await Payment.findOne({
          booking: booking._id,
        }).session(session);

      let refundAmount = 0;
      let refundStatus =
        "not_applicable";

      /*
      |--------------------------------------------------------------------------
      | Refund successful payment
      |--------------------------------------------------------------------------
      */

      if (
        payment &&
        payment.status === "success"
      ) {
        refundAmount = payment.amount;

        payment.status = "refunded";
        payment.refundedAt = new Date();
        payment.refundAmount =
          refundAmount;

        await payment.save({
          session,
        });

        booking.paymentStatus =
          "refunded";

        refundStatus = "refunded";
      }

      /*
      |--------------------------------------------------------------------------
      | Mark booking cancelled
      |--------------------------------------------------------------------------
      */

      booking.status = "cancelled";

      /*
      |--------------------------------------------------------------------------
      | Release seats
      |--------------------------------------------------------------------------
      */

      flight.availableSeats +=
        passengerCount;

      await booking.save({
        session,
      });

      await flight.save({
        session,
      });

      cancellationResult = {
        bookingId: booking._id,
        pnr: booking.pnr,
        status: booking.status,
        paymentStatus:
          booking.paymentStatus,
        refundAmount,
        refundStatus,
        seatsReleased:
          passengerCount,
      };
    });

    return res.status(200).json({
      success: true,
      message:
        "Booking cancelled successfully by admin",
      booking: {
        id: cancellationResult.bookingId,
        pnr: cancellationResult.pnr,
        status:
          cancellationResult.status,
        paymentStatus:
          cancellationResult.paymentStatus,
      },
      refund: {
        amount:
          cancellationResult.refundAmount,
        status:
          cancellationResult.refundStatus,
      },
      seatsReleased:
        cancellationResult.seatsReleased,
    });
  } catch (error) {
    console.error(
      "ADMIN CANCEL BOOKING ERROR:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to cancel booking",
    });
  } finally {
    await session.endSession();
  }
};