import Airline from "../models/Airline.js";

// ===============================
// CREATE AIRLINE
// ===============================
export const createAirline = async (req, res) => {
  try {
    const { name, code, country, logo } = req.body;

    if (!name || !code || !country) {
      return res.status(400).json({
        success: false,
        message: "Name, code and country are required",
      });
    }

    const existingAirline = await Airline.findOne({
      $or: [
        { name: name.trim() },
        { code: code.trim().toUpperCase() },
      ],
    });

    if (existingAirline) {
      return res.status(409).json({
        success: false,
        message: "Airline with this name or code already exists",
      });
    }

    const airline = await Airline.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      country: country.trim(),
      logo: logo?.trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Airline created successfully",
      airline,
    });
  } catch (error) {
    console.error("Create airline error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create airline",
      error: error.message,
    });
  }
};

// ===============================
// GET ALL AIRLINES
// ===============================
export const getAirlines = async (req, res) => {
  try {
    const airlines = await Airline.find().sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: airlines.length,
      airlines,
    });
  } catch (error) {
    console.error("Get airlines error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch airlines",
      error: error.message,
    });
  }
};

// ===============================
// GET SINGLE AIRLINE
// ===============================
export const getAirlineById = async (req, res) => {
  try {
    const airline = await Airline.findById(req.params.id);

    if (!airline) {
      return res.status(404).json({
        success: false,
        message: "Airline not found",
      });
    }

    return res.status(200).json({
      success: true,
      airline,
    });
  } catch (error) {
    console.error("Get airline error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch airline",
      error: error.message,
    });
  }
};

// ===============================
// UPDATE AIRLINE
// ===============================
export const updateAirline = async (req, res) => {
  try {
    const { name, code, country, logo, isActive } = req.body;

    const airline = await Airline.findById(req.params.id);

    if (!airline) {
      return res.status(404).json({
        success: false,
        message: "Airline not found",
      });
    }

    if (name !== undefined) {
      airline.name = name.trim();
    }

    if (code !== undefined) {
      airline.code = code.trim().toUpperCase();
    }

    if (country !== undefined) {
      airline.country = country.trim();
    }

    if (logo !== undefined) {
      airline.logo = logo.trim();
    }

    if (isActive !== undefined) {
      airline.isActive = isActive;
    }

    await airline.save();

    return res.status(200).json({
      success: true,
      message: "Airline updated successfully",
      airline,
    });
  } catch (error) {
    console.error("Update airline error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update airline",
      error: error.message,
    });
  }
};

// ===============================
// DELETE AIRLINE
// ===============================
export const deleteAirline = async (req, res) => {
  try {
    const airline = await Airline.findById(req.params.id);

    if (!airline) {
      return res.status(404).json({
        success: false,
        message: "Airline not found",
      });
    }

    await airline.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Airline deleted successfully",
    });
  } catch (error) {
    console.error("Delete airline error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete airline",
      error: error.message,
    });
  }
};