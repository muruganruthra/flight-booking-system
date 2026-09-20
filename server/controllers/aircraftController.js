import Aircraft from "../models/Aircraft.js";

// ========================================
// CREATE AIRCRAFT
// ========================================
export const createAircraft = async (req, res) => {
  try {
    const {
      model,
      manufacturer,
      registrationNumber,
      totalSeats,
      economySeats,
      businessSeats,
      firstClassSeats,
      seatLayout,
    } = req.body;

    if (
      !model ||
      !manufacturer ||
      !registrationNumber ||
      !totalSeats
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Model, manufacturer, registration number and total seats are required",
      });
    }

    const registration = registrationNumber
      .trim()
      .toUpperCase();

    const existingAircraft = await Aircraft.findOne({
      registrationNumber: registration,
    });

    if (existingAircraft) {
      return res.status(409).json({
        success: false,
        message:
          "Aircraft with this registration number already exists",
      });
    }

    const aircraft = await Aircraft.create({
      model: model.trim(),
      manufacturer: manufacturer.trim(),
      registrationNumber: registration,
      totalSeats,
      economySeats: economySeats || 0,
      businessSeats: businessSeats || 0,
      firstClassSeats: firstClassSeats || 0,
      seatLayout: seatLayout || "3-3",
    });

    return res.status(201).json({
      success: true,
      message: "Aircraft created successfully",
      aircraft,
    });
  } catch (error) {
    console.error("Create aircraft error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create aircraft",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL AIRCRAFT
// ========================================
export const getAircraft = async (req, res) => {
  try {
    const aircraft = await Aircraft.find().sort({
      manufacturer: 1,
      model: 1,
    });

    return res.status(200).json({
      success: true,
      count: aircraft.length,
      aircraft,
    });
  } catch (error) {
    console.error("Get aircraft error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch aircraft",
      error: error.message,
    });
  }
};

// ========================================
// GET AIRCRAFT BY ID
// ========================================
export const getAircraftById = async (req, res) => {
  try {
    const aircraft = await Aircraft.findById(req.params.id);

    if (!aircraft) {
      return res.status(404).json({
        success: false,
        message: "Aircraft not found",
      });
    }

    return res.status(200).json({
      success: true,
      aircraft,
    });
  } catch (error) {
    console.error("Get aircraft error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch aircraft",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE AIRCRAFT
// ========================================
export const updateAircraft = async (req, res) => {
  try {
    const {
      model,
      manufacturer,
      registrationNumber,
      totalSeats,
      economySeats,
      businessSeats,
      firstClassSeats,
      seatLayout,
      isActive,
    } = req.body;

    const aircraft = await Aircraft.findById(req.params.id);

    if (!aircraft) {
      return res.status(404).json({
        success: false,
        message: "Aircraft not found",
      });
    }

    if (model !== undefined) {
      aircraft.model = model.trim();
    }

    if (manufacturer !== undefined) {
      aircraft.manufacturer = manufacturer.trim();
    }

    if (registrationNumber !== undefined) {
      aircraft.registrationNumber =
        registrationNumber.trim().toUpperCase();
    }

    if (totalSeats !== undefined) {
      aircraft.totalSeats = totalSeats;
    }

    if (economySeats !== undefined) {
      aircraft.economySeats = economySeats;
    }

    if (businessSeats !== undefined) {
      aircraft.businessSeats = businessSeats;
    }

    if (firstClassSeats !== undefined) {
      aircraft.firstClassSeats = firstClassSeats;
    }

    if (seatLayout !== undefined) {
      aircraft.seatLayout = seatLayout.trim();
    }

    if (isActive !== undefined) {
      aircraft.isActive = isActive;
    }

    await aircraft.save();

    return res.status(200).json({
      success: true,
      message: "Aircraft updated successfully",
      aircraft,
    });
  } catch (error) {
    console.error("Update aircraft error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update aircraft",
      error: error.message,
    });
  }
};

// ========================================
// DELETE AIRCRAFT
// ========================================
export const deleteAircraft = async (req, res) => {
  try {
    const aircraft = await Aircraft.findById(req.params.id);

    if (!aircraft) {
      return res.status(404).json({
        success: false,
        message: "Aircraft not found",
      });
    }

    await aircraft.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Aircraft deleted successfully",
    });
  } catch (error) {
    console.error("Delete aircraft error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete aircraft",
      error: error.message,
    });
  }
};