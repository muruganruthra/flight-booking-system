import Flight from "../models/Flight.js";
import Airline from "../models/Airline.js";
import Airport from "../models/Airport.js";
import Aircraft from "../models/Aircraft.js";

// ========================================
// CREATE FLIGHT
// ========================================

export const createFlight = async (req, res) => {
  try {
    const {
      flightNumber,
      airline,
      aircraft,
      departureAirport,
      arrivalAirport,
      departureDateTime,
      arrivalDateTime,
      durationMinutes,
      economyPrice,
      businessPrice,
      firstClassPrice,
    } = req.body;

    if (
      !flightNumber ||
      !airline ||
      !aircraft ||
      !departureAirport ||
      !arrivalAirport ||
      !departureDateTime ||
      !arrivalDateTime ||
      !durationMinutes ||
      economyPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Flight number, airline, aircraft, airports, date/time, duration and economy price are required",
      });
    }

    const normalizedFlightNumber =
      flightNumber.trim().toUpperCase();

    const existingFlight = await Flight.findOne({
      flightNumber: normalizedFlightNumber,
    });

    if (existingFlight) {
      return res.status(409).json({
        success: false,
        message:
          "Flight with this flight number already exists",
      });
    }

    // ========================================
    // VALIDATE AIRLINE
    // ========================================

    const airlineExists = await Airline.findById(airline);

    if (!airlineExists) {
      return res.status(404).json({
        success: false,
        message: "Airline not found",
      });
    }

    if (!airlineExists.isActive) {
      return res.status(400).json({
        success: false,
        message: "Selected airline is inactive",
      });
    }

    // ========================================
    // VALIDATE DEPARTURE AIRPORT
    // ========================================

    const departureAirportExists =
      await Airport.findById(departureAirport);

    if (!departureAirportExists) {
      return res.status(404).json({
        success: false,
        message: "Departure airport not found",
      });
    }

    if (!departureAirportExists.isActive) {
      return res.status(400).json({
        success: false,
        message: "Departure airport is inactive",
      });
    }

    // ========================================
    // VALIDATE ARRIVAL AIRPORT
    // ========================================

    const arrivalAirportExists =
      await Airport.findById(arrivalAirport);

    if (!arrivalAirportExists) {
      return res.status(404).json({
        success: false,
        message: "Arrival airport not found",
      });
    }

    if (!arrivalAirportExists.isActive) {
      return res.status(400).json({
        success: false,
        message: "Arrival airport is inactive",
      });
    }

    // ========================================
    // SAME AIRPORT VALIDATION
    // ========================================

    if (departureAirport === arrivalAirport) {
      return res.status(400).json({
        success: false,
        message:
          "Departure airport and arrival airport cannot be the same",
      });
    }

    // ========================================
    // VALIDATE AIRCRAFT
    // ========================================

    const aircraftExists =
      await Aircraft.findById(aircraft);

    if (!aircraftExists) {
      return res.status(404).json({
        success: false,
        message: "Aircraft not found",
      });
    }

    if (!aircraftExists.isActive) {
      return res.status(400).json({
        success: false,
        message: "Selected aircraft is inactive",
      });
    }

    // ========================================
    // VALIDATE DATES
    // ========================================

    const departure = new Date(departureDateTime);
    const arrival = new Date(arrivalDateTime);

    if (Number.isNaN(departure.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid departure date and time",
      });
    }

    if (Number.isNaN(arrival.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid arrival date and time",
      });
    }

    if (arrival <= departure) {
      return res.status(400).json({
        success: false,
        message:
          "Arrival date and time must be after departure date and time",
      });
    }

    // ========================================
    // VALIDATE PRICES
    // ========================================

    if (Number(economyPrice) < 0) {
      return res.status(400).json({
        success: false,
        message: "Economy price cannot be negative",
      });
    }

    if (
      businessPrice !== undefined &&
      Number(businessPrice) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Business price cannot be negative",
      });
    }

    if (
      firstClassPrice !== undefined &&
      Number(firstClassPrice) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "First class price cannot be negative",
      });
    }

    // ========================================
    // CREATE FLIGHT
    // ========================================

    const flight = await Flight.create({
      flightNumber: normalizedFlightNumber,
      airline,
      aircraft,
      departureAirport,
      arrivalAirport,
      departureDateTime: departure,
      arrivalDateTime: arrival,
      durationMinutes,
      economyPrice,
      businessPrice: businessPrice || 0,
      firstClassPrice: firstClassPrice || 0,
      availableSeats: aircraftExists.totalSeats,
    });

    await flight.populate([
      { path: "airline" },
      { path: "aircraft" },
      { path: "departureAirport" },
      { path: "arrivalAirport" },
    ]);

    return res.status(201).json({
      success: true,
      message: "Flight created successfully",
      flight,
    });
  } catch (error) {
    console.error("Create flight error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create flight",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL FLIGHTS
// ========================================

export const getFlights = async (req, res) => {
  try {
    const flights = await Flight.find()
      .populate(
        "airline",
        "name code country logo"
      )
      .populate(
        "aircraft",
        "model manufacturer registrationNumber totalSeats economySeats businessSeats firstClassSeats seatLayout"
      )
      .populate(
        "departureAirport",
        "name code city country terminalCount"
      )
      .populate(
        "arrivalAirport",
        "name code city country terminalCount"
      )
      .sort({
        departureDateTime: 1,
      });

    return res.status(200).json({
      success: true,
      count: flights.length,
      flights,
    });
  } catch (error) {
    console.error("Get flights error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch flights",
      error: error.message,
    });
  }
};

// ========================================
// SEARCH FLIGHTS
// ========================================

export const searchFlights = async (req, res) => {
  try {
    const {
      from,
      to,
      date,
      passengers,
    } = req.query;

    // ========================================
    // REQUIRED SEARCH PARAMETERS
    // ========================================

    if (!from || !to || !date) {
      return res.status(400).json({
        success: false,
        message:
          "Departure airport, arrival airport and travel date are required",
      });
    }

    const departureCode = from.trim().toUpperCase();
    const arrivalCode = to.trim().toUpperCase();

    // ========================================
    // PREVENT SAME AIRPORT
    // ========================================

    if (departureCode === arrivalCode) {
      return res.status(400).json({
        success: false,
        message:
          "Departure and arrival airports cannot be the same",
      });
    }

    // ========================================
    // VALIDATE PASSENGERS
    // ========================================

    const passengerCount =
      Number(passengers || 1);

    if (
      !Number.isInteger(passengerCount) ||
      passengerCount < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Passenger count must be at least 1",
      });
    }

    // ========================================
    // VALIDATE DATE
    // ========================================

    const searchDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(searchDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid travel date",
      });
    }

    const nextDate = new Date(searchDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // ========================================
    // SEARCH
    // ========================================

    const flights = await Flight.find({
      isActive: true,

      status: {
        $in: [
          "scheduled",
          "boarding",
          "delayed",
        ],
      },

      availableSeats: {
        $gte: passengerCount,
      },

      departureDateTime: {
        $gte: searchDate,
        $lt: nextDate,
      },
    })
      .populate({
        path: "airline",
        select: "name code country logo",
      })
      .populate({
        path: "aircraft",
        select:
          "model manufacturer registrationNumber totalSeats economySeats businessSeats firstClassSeats seatLayout",
      })
      .populate({
        path: "departureAirport",
        select:
          "name code city country terminalCount",
        match: {
          code: departureCode,
        },
      })
      .populate({
        path: "arrivalAirport",
        select:
          "name code city country terminalCount",
        match: {
          code: arrivalCode,
        },
      })
      .sort({
        departureDateTime: 1,
        economyPrice: 1,
      });

    // ========================================
    // REMOVE NON-MATCHING POPULATED AIRPORTS
    // ========================================

    const matchingFlights = flights.filter(
      (flight) =>
        flight.departureAirport &&
        flight.arrivalAirport
    );

    return res.status(200).json({
      success: true,
      count: matchingFlights.length,
      search: {
        from: departureCode,
        to: arrivalCode,
        date,
        passengers: passengerCount,
      },
      flights: matchingFlights,
    });
  } catch (error) {
    console.error("Search flights error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search flights",
      error: error.message,
    });
  }
};

// ========================================
// GET FLIGHT BY ID
// ========================================

export const getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate("airline")
      .populate("aircraft")
      .populate("departureAirport")
      .populate("arrivalAirport");

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Flight not found",
      });
    }

    return res.status(200).json({
      success: true,
      flight,
    });
  } catch (error) {
    console.error("Get flight error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch flight",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE FLIGHT
// ========================================

export const updateFlight = async (req, res) => {
  try {
    const {
      flightNumber,
      airline,
      aircraft,
      departureAirport,
      arrivalAirport,
      departureDateTime,
      arrivalDateTime,
      durationMinutes,
      economyPrice,
      businessPrice,
      firstClassPrice,
      status,
      isActive,
    } = req.body;

    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Flight not found",
      });
    }

    // ========================================
    // FLIGHT NUMBER
    // ========================================

    if (flightNumber !== undefined) {
      const normalizedFlightNumber =
        flightNumber.trim().toUpperCase();

      const duplicateFlight =
        await Flight.findOne({
          flightNumber: normalizedFlightNumber,
          _id: { $ne: flight._id },
        });

      if (duplicateFlight) {
        return res.status(409).json({
          success: false,
          message:
            "Another flight with this flight number already exists",
        });
      }

      flight.flightNumber =
        normalizedFlightNumber;
    }

    // ========================================
    // AIRLINE
    // ========================================

    if (airline !== undefined) {
      const airlineExists =
        await Airline.findById(airline);

      if (!airlineExists) {
        return res.status(404).json({
          success: false,
          message: "Airline not found",
        });
      }

      if (!airlineExists.isActive) {
        return res.status(400).json({
          success: false,
          message: "Selected airline is inactive",
        });
      }

      flight.airline = airline;
    }

    // ========================================
    // AIRCRAFT
    // ========================================

    if (aircraft !== undefined) {
      const aircraftExists =
        await Aircraft.findById(aircraft);

      if (!aircraftExists) {
        return res.status(404).json({
          success: false,
          message: "Aircraft not found",
        });
      }

      if (!aircraftExists.isActive) {
        return res.status(400).json({
          success: false,
          message: "Selected aircraft is inactive",
        });
      }

      const oldAircraft =
        await Aircraft.findById(
          flight.aircraft
        );

      const bookingsMade =
        oldAircraft
          ? oldAircraft.totalSeats -
            flight.availableSeats
          : 0;

      if (bookingsMade > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Aircraft cannot be changed after seats have been booked",
        });
      }

      flight.aircraft = aircraftExists._id;

      flight.availableSeats =
        aircraftExists.totalSeats;
    }

    // ========================================
    // DEPARTURE AIRPORT
    // ========================================

    if (departureAirport !== undefined) {
      const airportExists =
        await Airport.findById(
          departureAirport
        );

      if (!airportExists) {
        return res.status(404).json({
          success: false,
          message:
            "Departure airport not found",
        });
      }

      if (!airportExists.isActive) {
        return res.status(400).json({
          success: false,
          message:
            "Departure airport is inactive",
        });
      }

      flight.departureAirport =
        departureAirport;
    }

    // ========================================
    // ARRIVAL AIRPORT
    // ========================================

    if (arrivalAirport !== undefined) {
      const airportExists =
        await Airport.findById(
          arrivalAirport
        );

      if (!airportExists) {
        return res.status(404).json({
          success: false,
          message:
            "Arrival airport not found",
        });
      }

      if (!airportExists.isActive) {
        return res.status(400).json({
          success: false,
          message:
            "Arrival airport is inactive",
        });
      }

      flight.arrivalAirport =
        arrivalAirport;
    }

    // ========================================
    // SAME AIRPORT VALIDATION
    // ========================================

    if (
      flight.departureAirport.toString() ===
      flight.arrivalAirport.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Departure airport and arrival airport cannot be the same",
      });
    }

    // ========================================
    // DATE / TIME
    // ========================================

    if (departureDateTime !== undefined) {
      const departure =
        new Date(departureDateTime);

      if (Number.isNaN(departure.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid departure date and time",
        });
      }

      flight.departureDateTime =
        departure;
    }

    if (arrivalDateTime !== undefined) {
      const arrival =
        new Date(arrivalDateTime);

      if (Number.isNaN(arrival.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid arrival date and time",
        });
      }

      flight.arrivalDateTime = arrival;
    }

    if (
      flight.arrivalDateTime <=
      flight.departureDateTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Arrival date and time must be after departure date and time",
      });
    }

    // ========================================
    // DURATION
    // ========================================

    if (durationMinutes !== undefined) {
      if (Number(durationMinutes) <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "Duration must be greater than zero",
        });
      }

      flight.durationMinutes =
        durationMinutes;
    }

    // ========================================
    // PRICES
    // ========================================

    if (economyPrice !== undefined) {
      if (Number(economyPrice) < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Economy price cannot be negative",
        });
      }

      flight.economyPrice =
        economyPrice;
    }

    if (businessPrice !== undefined) {
      if (Number(businessPrice) < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Business price cannot be negative",
        });
      }

      flight.businessPrice =
        businessPrice;
    }

    if (firstClassPrice !== undefined) {
      if (Number(firstClassPrice) < 0) {
        return res.status(400).json({
          success: false,
          message:
            "First class price cannot be negative",
        });
      }

      flight.firstClassPrice =
        firstClassPrice;
    }

    // ========================================
    // STATUS
    // ========================================

    if (status !== undefined) {
      const allowedStatuses = [
        "scheduled",
        "boarding",
        "departed",
        "arrived",
        "delayed",
        "cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid flight status",
        });
      }

      flight.status = status;
    }

    // ========================================
    // ACTIVE
    // ========================================

    if (isActive !== undefined) {
      flight.isActive = isActive;
    }

    await flight.save();

    await flight.populate([
      { path: "airline" },
      { path: "aircraft" },
      { path: "departureAirport" },
      { path: "arrivalAirport" },
    ]);

    return res.status(200).json({
      success: true,
      message: "Flight updated successfully",
      flight,
    });
  } catch (error) {
    console.error("Update flight error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update flight",
      error: error.message,
    });
  }
};

// ========================================
// DELETE FLIGHT
// ========================================

export const deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Flight not found",
      });
    }

    await flight.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Flight deleted successfully",
    });
  } catch (error) {
    console.error("Delete flight error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete flight",
      error: error.message,
    });
  }
};