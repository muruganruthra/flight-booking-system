import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Booking from "../models/Booking.js";
import Flight from "../models/Flight.js";
import Payment from "../models/Payment.js";

import { generatePNR } from "../utils/generatePNR.js";
import { generateTicketPDF } from "../utils/generateTicket.js";

import { sendTicketEmail } from "../services/emailService.js";

const TAX_RATE = 0.05;
const CONVENIENCE_FEE_PER_PASSENGER = 200;

/*
|--------------------------------------------------------------------------
| Generate Seat List
|--------------------------------------------------------------------------
*/

const generateSeatList = (totalSeats, seatLayout) => {
  const seats = [];

  if (!seatLayout) {
    throw new Error("Seat layout is not configured");
  }

  const parts = seatLayout.split("-").map(Number);

  if (
    parts.length !== 2 ||
    Number.isNaN(parts[0]) ||
    Number.isNaN(parts[1])
  ) {
    throw new Error(
      "Invalid seat layout. Expected format such as 3-3"
    );
  }

  const seatsPerRow = parts[0] + parts[1];

  const seatLetters = "ABCDEF";

  let seatCount = 0;
  let row = 1;

  while (seatCount < totalSeats) {
    for (let i = 0; i < seatsPerRow; i++) {
      if (seatCount >= totalSeats) {
        break;
      }

      seats.push(`${row}${seatLetters[i]}`);
      seatCount++;
    }

    row++;
  }

  return seats;
};

/*
|--------------------------------------------------------------------------
| Get Seat Class Map
|--------------------------------------------------------------------------
*/

const getSeatClassMap = (aircraft) => {
  const seatClassMap = {};

  const totalSeats = aircraft.totalSeats || 0;

  const firstSeats = aircraft.firstClassSeats || 0;
  const businessSeats = aircraft.businessClassSeats || 0;
  const economySeats = aircraft.economyClassSeats || 0;

  let seatIndex = 0;

  const seatLetters = "ABCDEF";

  const seatsPerRow = aircraft.seatLayout
    ? aircraft.seatLayout
        .split("-")
        .map(Number)
        .reduce((a, b) => a + b, 0)
    : 6;

  let row = 1;

  while (seatIndex < totalSeats) {
    for (let i = 0; i < seatsPerRow; i++) {
      if (seatIndex >= totalSeats) {
        break;
      }

      const seatNumber = `${row}${seatLetters[i]}`;

      if (seatIndex < firstSeats) {
        seatClassMap[seatNumber] = "first";
      } else if (
        seatIndex <
        firstSeats + businessSeats
      ) {
        seatClassMap[seatNumber] = "business";
      } else {
        seatClassMap[seatNumber] = "economy";
      }

      seatIndex++;
    }

    row++;
  }

  /*
   * Fallback if aircraft class counts are not available
   */

  if (
    Object.keys(seatClassMap).length === 0 &&
    totalSeats > 0
  ) {
    const seats = generateSeatList(
      totalSeats,
      aircraft.seatLayout
    );

    seats.forEach((seat) => {
      seatClassMap[seat] = "economy";
    });
  }

  return seatClassMap;
};

/*
|--------------------------------------------------------------------------
| Get Available Seats
|--------------------------------------------------------------------------
*/

export const getAvailableSeats = async (req, res) => {
  try {
    const { flightId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(flightId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid flight ID",
      });
    }

    const flight = await Flight.findById(flightId)
      .populate("aircraft")
      .populate("airline")
      .populate("departureAirport")
      .populate("arrivalAirport");

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Flight not found",
      });
    }

    if (!flight.isActive) {
      return res.status(400).json({
        success: false,
        message: "Flight is not active",
      });
    }

    const now = new Date();

    /*
     * Confirmed bookings always occupy seats.
     *
     * Pending bookings occupy seats only until
     * their payment-hold expiry time.
     */

    const bookings = await Booking.find({
      flight: flight._id,
      $or: [
        {
          status: "confirmed",
        },
        {
          status: "pending",
          expiresAt: {
            $gt: now,
          },
        },
      ],
    });

    const bookedSeats = [];

    bookings.forEach((booking) => {
      booking.passengers.forEach((passenger) => {
        bookedSeats.push(
          passenger.seatNumber.toUpperCase()
        );
      });
    });

    const aircraft = flight.aircraft;

    if (!aircraft) {
      return res.status(400).json({
        success: false,
        message: "Aircraft information not found",
      });
    }

    const allSeats = generateSeatList(
      aircraft.totalSeats,
      aircraft.seatLayout
    );

    const availableSeats = allSeats.filter(
      (seat) => !bookedSeats.includes(seat)
    );

    return res.status(200).json({
      success: true,
      flight: {
        id: flight._id,
        flightNumber: flight.flightNumber,
        availableSeats: flight.availableSeats,
      },
      bookedSeats,
      availableSeats,
      totalSeats: allSeats.length,
    });
  } catch (error) {
    console.error(
      "GET AVAILABLE SEATS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch available seats",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Create Booking
|--------------------------------------------------------------------------
*/

export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      flightId,
      passengers,
      contactEmail,
      contactPhone,
    } = req.body;

    /*
     * Validate flight ID
     */

    if (
      !flightId ||
      !mongoose.Types.ObjectId.isValid(flightId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid flightId is required",
      });
    }

    /*
     * Validate passengers
     */

    if (
      !Array.isArray(passengers) ||
      passengers.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one passenger is required",
      });
    }

    if (passengers.length > 9) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum 9 passengers allowed per booking",
      });
    }

    /*
     * Validate contact information
     */

    if (!contactEmail || !contactPhone) {
      return res.status(400).json({
        success: false,
        message:
          "Contact email and phone are required",
      });
    }

    /*
     * Required passenger fields
     */

    const requiredPassengerFields = [
      "title",
      "firstName",
      "lastName",
      "dateOfBirth",
      "gender",
      "seatNumber",
      "travelClass",
    ];

    for (const passenger of passengers) {
      for (const field of requiredPassengerFields) {
        if (
          passenger[field] === undefined ||
          passenger[field] === null ||
          passenger[field] === ""
        ) {
          return res.status(400).json({
            success: false,
            message:
              `${field} is required for every passenger`,
          });
        }
      }
    }

    /*
     * Check duplicate seats inside request
     */

    const requestedSeats = passengers.map(
      (passenger) =>
        passenger.seatNumber.toUpperCase()
    );

    const uniqueSeats = new Set(requestedSeats);

    if (
      uniqueSeats.size !==
      requestedSeats.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Multiple passengers cannot use the same seat",
      });
    }

    let createdBooking;

    /*
     * Start transaction
     */

    await session.withTransaction(async () => {
      /*
       * Find flight
       */

      const flights = await Flight.find({
        _id: flightId,
      })
        .populate("aircraft")
        .populate("airline")
        .populate("departureAirport")
        .populate("arrivalAirport")
        .session(session);

      const flight = flights[0];

      if (!flight) {
        throw new Error("Flight not found");
      }

      /*
       * Validate flight
       */

      if (!flight.isActive) {
        throw new Error("Flight is not active");
      }

      if (
        ![
          "scheduled",
          "boarding",
          "delayed",
        ].includes(flight.status)
      ) {
        throw new Error(
          `Flight cannot be booked while status is ${flight.status}`
        );
      }

      /*
       * Validate aircraft
       */

      if (!flight.aircraft) {
        throw new Error(
          "Aircraft information not found"
        );
      }

      /*
       * Check available seat count
       */

      if (
        passengers.length >
        flight.availableSeats
      ) {
        throw new Error(
          "Not enough available seats"
        );
      }

      const aircraft = flight.aircraft;

      /*
       * Generate all seats
       */

      const allSeats = generateSeatList(
        aircraft.totalSeats,
        aircraft.seatLayout
      );

      /*
       * Generate seat class map
       */

      const seatClassMap =
        getSeatClassMap(aircraft);

      /*
       * Validate requested seats
       */

      for (const passenger of passengers) {
        const seatNumber =
          passenger.seatNumber.toUpperCase();

        if (!allSeats.includes(seatNumber)) {
          throw new Error(
            `Invalid seat number: ${seatNumber}`
          );
        }

        const actualClass =
          seatClassMap[seatNumber];

        if (!actualClass) {
          throw new Error(
            `Class not configured for seat ${seatNumber}`
          );
        }

        if (
          passenger.travelClass !==
          actualClass
        ) {
          throw new Error(
            `Seat ${seatNumber} belongs to ${actualClass} class`
          );
        }
      }

      /*
       * Check existing bookings
       */

      const now = new Date();

      const existingBookings =
        await Booking.find({
          flight: flight._id,
          $or: [
            {
              status: "confirmed",
            },
            {
              status: "pending",
              expiresAt: {
                $gt: now,
              },
            },
          ],
        }).session(session);

      const bookedSeats = new Set();

      existingBookings.forEach(
        (booking) => {
          booking.passengers.forEach(
            (passenger) => {
              bookedSeats.add(
                passenger.seatNumber.toUpperCase()
              );
            }
          );
        }
      );

      /*
       * Check requested seats against
       * existing bookings
       */

      for (const seat of requestedSeats) {
        if (bookedSeats.has(seat)) {
          throw new Error(
            `Seat ${seat} is already booked`
          );
        }
      }

      /*
       * Calculate base fare
       *
       * IMPORTANT:
       * Flight model contains:
       * economyPrice
       * businessPrice
       * firstClassPrice
       *
       * It does NOT contain flight.prices
       */

      let baseFare = 0;

      for (const passenger of passengers) {
        if (
          passenger.travelClass ===
          "economy"
        ) {
          baseFare += flight.economyPrice;
        } else if (
          passenger.travelClass ===
          "business"
        ) {
          baseFare += flight.businessPrice;
        } else if (
          passenger.travelClass ===
          "first"
        ) {
          baseFare += flight.firstClassPrice;
        } else {
          throw new Error(
            `Invalid travel class: ${passenger.travelClass}`
          );
        }
      }

      /*
       * Validate fare values
       */

      if (!Number.isFinite(baseFare)) {
        throw new Error(
          "Flight fare configuration is invalid"
        );
      }

      /*
       * Calculate tax
       */

      const tax = baseFare * TAX_RATE;

      /*
       * Convenience fee
       */

      const convenienceFee =
        passengers.length *
        CONVENIENCE_FEE_PER_PASSENGER;

      /*
       * Total amount
       */

      const totalAmount =
        baseFare +
        tax +
        convenienceFee;

      /*
       * Generate unique PNR
       */

      let pnr;
      let existingPNR;

      do {
        pnr = generatePNR();

        existingPNR =
          await Booking.findOne({
            pnr,
          }).session(session);
      } while (existingPNR);

      /*
       * Prepare passengers
       */

      const passengerData =
        passengers.map(
          (passenger) => ({
            title: passenger.title,
            firstName:
              passenger.firstName,
            lastName:
              passenger.lastName,
            dateOfBirth:
              passenger.dateOfBirth,
            gender: passenger.gender,
            passportNumber:
              passenger.passportNumber ||
              "",
            nationality:
              passenger.nationality ||
              "Indian",
            seatNumber:
              passenger.seatNumber.toUpperCase(),
            travelClass:
              passenger.travelClass,
            baggage:
              passenger.baggage || 0,
          })
        );

      /*
       * Create booking
       */

      const booking = new Booking({
        user: req.user._id,
        flight: flight._id,
        pnr,
        passengers: passengerData,
        contactEmail,
        contactPhone,
        baseFare,
        tax,
        convenienceFee,
        totalAmount,
        status: "pending",
        paymentStatus: "pending",
        expiresAt: new Date(
          Date.now() +
            15 * 60 * 1000
        ),
      });

      await booking.save({
        session,
      });

      /*
       * Reserve seats
       *
       * Decrease availableSeats immediately.
       * The expiration service will release them
       * if payment is not completed within 15 minutes.
       */

      const updatedFlight =
        await Flight.findOneAndUpdate(
          {
            _id: flight._id,
            availableSeats: {
              $gte: passengers.length,
            },
          },
          {
            $inc: {
              availableSeats:
                -passengers.length,
            },
          },
          {
            new: true,
            session,
          }
        );

      if (!updatedFlight) {
        throw new Error(
          "Seats are no longer available"
        );
      }

      createdBooking = booking;
    });

    /*
     * Populate booking after transaction
     */

    const populatedBooking =
      await Booking.findById(
        createdBooking._id
      )
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
        .populate("user");

    return res.status(201).json({
      success: true,
      message:
        "Booking created successfully. Payment is pending.",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error(
      "CREATE BOOKING ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create booking",
    });
  } finally {
    await session.endSession();
  }
};

/*
|--------------------------------------------------------------------------
| Get My Bookings
|--------------------------------------------------------------------------
*/

export const getMyBookings = async (
  req,
  res
) => {
  try {
    const bookings =
      await Booking.find({
        user: req.user._id,
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
      "GET MY BOOKINGS ERROR:",
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
| Get Booking By ID
|--------------------------------------------------------------------------
*/

export const getBookingById = async (
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

    const booking =
      await Booking.findById(id)
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
        .populate("user");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.user._id.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to view this booking",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error(
      "GET BOOKING ERROR:",
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
| Generate Ticket
|--------------------------------------------------------------------------
*/

export const generateTicket = async (
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

    const booking =
      await Booking.findById(id)
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
          ],
        })
        .populate("user");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.user._id.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to generate this ticket",
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message:
          "Ticket can only be generated for a confirmed booking",
      });
    }

    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message:
          "Payment must be completed before generating the ticket",
      });
    }

    const ticket =
      await generateTicketPDF(booking);

    return res.status(200).json({
      success: true,
      message:
        "Ticket generated successfully",
      ticket: {
        fileName: ticket.fileName,
        downloadUrl:
          `/api/bookings/${booking._id}/ticket`,
      },
    });
  } catch (error) {
    console.error(
      "GENERATE TICKET ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate ticket",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Download Ticket
|--------------------------------------------------------------------------
*/

export const downloadTicket = async (
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

    const booking =
      await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to download this ticket",
      });
    }

    if (
      booking.status !== "confirmed" ||
      booking.paymentStatus !== "paid"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Ticket is available only for confirmed and paid bookings",
      });
    }

    const __filename =
      fileURLToPath(import.meta.url);

    const __dirname =
      path.dirname(__filename);

    const filePath = path.join(
      __dirname,
      "../tickets",
      `ticket-${booking.pnr}.pdf`
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message:
          "Ticket PDF not found. Generate the ticket first.",
      });
    }

    return res.download(
      filePath,
      `Flight-Ticket-${booking.pnr}.pdf`
    );
  } catch (error) {
    console.error(
      "DOWNLOAD TICKET ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to download ticket",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Send Ticket By Email
|--------------------------------------------------------------------------
*/

export const sendTicketByEmail = async (
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

    const booking =
      await Booking.findById(id)
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
          ],
        })
        .populate("user");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.user._id.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to send this ticket",
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message:
          "Ticket can only be emailed for a confirmed booking",
      });
    }

    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message:
          "Payment must be completed before sending the ticket",
      });
    }

    const ticket =
      await generateTicketPDF(booking);

    const firstPassenger =
      booking.passengers[0];

    const passengerName =
      `${firstPassenger.title} ` +
      `${firstPassenger.firstName} ` +
      `${firstPassenger.lastName}`;

    const flight = booking.flight;

    const flightNumber =
      flight?.flightNumber || "N/A";

    const departureAirport =
      flight?.departureAirport
        ? `${flight.departureAirport.name} (${flight.departureAirport.code})`
        : "N/A";

    const arrivalAirport =
      flight?.arrivalAirport
        ? `${flight.arrivalAirport.name} (${flight.arrivalAirport.code})`
        : "N/A";

    /*
     * Correct Flight model field:
     * departureDateTime
     */

    const departureTime =
      flight?.departureDateTime
        ? new Date(
            flight.departureDateTime
          ).toLocaleString("en-IN")
        : "N/A";

    const emailResult =
      await sendTicketEmail({
        to: booking.contactEmail,
        passengerName,
        pnr: booking.pnr,
        flightNumber,
        departureAirport,
        arrivalAirport,
        departureTime,
        ticketPath: ticket.filePath,
      });

    return res.status(200).json({
      success: true,
      message:
        "Ticket generated and sent to your email successfully",
      email: booking.contactEmail,
      pnr: booking.pnr,
      messageId:
        emailResult.messageId,
    });
  } catch (error) {
    console.error(
      "SEND TICKET BY EMAIL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to send ticket email",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Cancel Booking + Refund
|--------------------------------------------------------------------------
*/

export const cancelBooking = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    let cancellationResult;

    await session.withTransaction(
      async () => {
        /*
         * Find booking
         */

        const booking =
          await Booking.findById(id)
            .session(session);

        if (!booking) {
          throw new Error(
            "Booking not found"
          );
        }

        /*
         * Authorization
         */

        if (
          booking.user.toString() !==
          req.user._id.toString()
        ) {
          const error =
            new Error(
              "You are not authorized to cancel this booking"
            );

          error.statusCode = 403;

          throw error;
        }

        /*
         * Already cancelled
         */

        if (booking.status === "cancelled") {
          throw new Error(
            "Booking is already cancelled"
          );
        }

        /*
         * Completed booking
         */

        if (booking.status === "completed") {
          throw new Error(
            "Completed booking cannot be cancelled"
          );
        }

        /*
         * Find flight
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
         * Number of seats to release
         */

        const passengerCount =
          booking.passengers.length;

        /*
         * Find payment
         */

        const payment =
          await Payment.findOne({
            booking: booking._id,
          }).session(session);

        let refundAmount = 0;
        let refundStatus =
          "not_applicable";

        /*
         * Refund successful payment
         */

        if (
          payment &&
          payment.status === "success"
        ) {
          refundAmount =
            payment.amount;

          payment.status = "refunded";
          payment.refundedAt =
            new Date();
          payment.refundAmount =
            refundAmount;

          await payment.save({
            session,
          });

          booking.paymentStatus =
            "refunded";

          refundStatus =
            "refunded";
        } else if (
          payment &&
          payment.status === "refunded"
        ) {
          refundAmount =
            payment.refundAmount || 0;

          booking.paymentStatus =
            "refunded";

          refundStatus =
            "refunded";
        }

        /*
         * Cancel booking
         */

        booking.status = "cancelled";

        /*
         * Release seats
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
          bookingId:
            booking._id,
          pnr: booking.pnr,
          status:
            booking.status,
          paymentStatus:
            booking.paymentStatus,
          refundAmount,
          refundStatus,
          seatsReleased:
            passengerCount,
        };
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Booking cancelled successfully",
      booking: {
        id:
          cancellationResult.bookingId,
        pnr:
          cancellationResult.pnr,
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
      "CANCEL BOOKING ERROR:",
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