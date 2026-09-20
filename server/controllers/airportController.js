import Airport from "../models/Airport.js";

// ========================================
// CREATE AIRPORT
// ========================================
export const createAirport = async (req, res) => {
  try {
    const {
      name,
      code,
      city,
      country,
      terminalCount,
    } = req.body;

    if (!name || !code || !city || !country) {
      return res.status(400).json({
        success: false,
        message: "Name, code, city and country are required",
      });
    }

    const airportCode = code.trim().toUpperCase();

    const existingAirport = await Airport.findOne({
      code: airportCode,
    });

    if (existingAirport) {
      return res.status(409).json({
        success: false,
        message: "Airport with this code already exists",
      });
    }

    const airport = await Airport.create({
      name: name.trim(),
      code: airportCode,
      city: city.trim(),
      country: country.trim(),
      terminalCount: terminalCount || 1,
    });

    return res.status(201).json({
      success: true,
      message: "Airport created successfully",
      airport,
    });
  } catch (error) {
    console.error("Create airport error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create airport",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL AIRPORTS
// ========================================
export const getAirports = async (req, res) => {
  try {
    const airports = await Airport.find().sort({
      city: 1,
      name: 1,
    });

    return res.status(200).json({
      success: true,
      count: airports.length,
      airports,
    });
  } catch (error) {
    console.error("Get airports error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch airports",
      error: error.message,
    });
  }
};

// ========================================
// GET AIRPORT BY ID
// ========================================
export const getAirportById = async (req, res) => {
  try {
    const airport = await Airport.findById(req.params.id);

    if (!airport) {
      return res.status(404).json({
        success: false,
        message: "Airport not found",
      });
    }

    return res.status(200).json({
      success: true,
      airport,
    });
  } catch (error) {
    console.error("Get airport error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch airport",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE AIRPORT
// ========================================
export const updateAirport = async (req, res) => {
  try {
    const {
      name,
      code,
      city,
      country,
      terminalCount,
      isActive,
    } = req.body;

    const airport = await Airport.findById(req.params.id);

    if (!airport) {
      return res.status(404).json({
        success: false,
        message: "Airport not found",
      });
    }

    if (name !== undefined) {
      airport.name = name.trim();
    }

    if (code !== undefined) {
      airport.code = code.trim().toUpperCase();
    }

    if (city !== undefined) {
      airport.city = city.trim();
    }

    if (country !== undefined) {
      airport.country = country.trim();
    }

    if (terminalCount !== undefined) {
      airport.terminalCount = terminalCount;
    }

    if (isActive !== undefined) {
      airport.isActive = isActive;
    }

    await airport.save();

    return res.status(200).json({
      success: true,
      message: "Airport updated successfully",
      airport,
    });
  } catch (error) {
    console.error("Update airport error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update airport",
      error: error.message,
    });
  }
};

// ========================================
// DELETE AIRPORT
// ========================================
export const deleteAirport = async (req, res) => {
  try {
    const airport = await Airport.findById(req.params.id);

    if (!airport) {
      return res.status(404).json({
        success: false,
        message: "Airport not found",
      });
    }

    await airport.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Airport deleted successfully",
    });
  } catch (error) {
    console.error("Delete airport error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete airport",
      error: error.message,
    });
  }
};