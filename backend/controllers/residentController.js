const Resident = require("../models/Resident");

// Add Resident
const addResident = async (req, res) => {
  try {
    const resident = await Resident.create(req.body);

    res.status(201).json({
      success: true,
      message: "Resident added successfully",
      resident,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add resident",
      error: error.message,
    });
  }
};

// Get All Residents
const getResidents = async (req, res) => {
  try {
    const residents = await Resident.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      residents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch residents",
      error: error.message,
    });
  }
};

module.exports = {
  addResident,
  getResidents,
};