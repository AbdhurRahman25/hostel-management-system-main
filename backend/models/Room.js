const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    roomType: {
      type: String,
      enum: ["Single", "Double", "Triple", "Dormitory", "Shared"],
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    occupied: {
  type: Number,
  required: true,
  min: 0,
  default: 0,

  validate: {
    validator: function (value) {
      // Normal document save/create
      if (this.capacity !== undefined) {
        return value <= this.capacity;
      }

      // Update operation
      const update = this.getUpdate
        ? this.getUpdate()
        : null;

      const capacity =
        update?.capacity ??
        update?.$set?.capacity;

      if (capacity !== undefined) {
        return value <= Number(capacity);
      }

      return true;
    },

    message:
      "Occupied beds cannot be greater than capacity",
  },
},

    rent: {
      type: Number,
      default: 0,
      min: 0,
    },

    utilitiesFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Available", "Occupied", "Maintenance"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Room", roomSchema);