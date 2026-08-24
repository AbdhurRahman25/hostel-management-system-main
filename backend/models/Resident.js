const mongoose = require("mongoose");

const residentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    emergencyContact: {
      name: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      relationship: {
        type: String,
        required: true,
      },
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },

    roomNumber: {
      type: String,
      default: null,
    },

    preferreedRoomType:{
      type:String,
      default: null,
    },

    checkInDate: {
      type: Date,
      default: null,
    },

    checkOutDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["Active", "Checked Out"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resident", residentSchema);