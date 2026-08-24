const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema(
  {
    residentName: {
      type: String,
      required: true,
      trim: true,
    },

    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },

    rent: {
      type: Number,
      required: true,
      min: 0,
    },

    otherCharges: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lateFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// Automatically calculate total amount before saving
billingSchema.pre("save", function () {
  const rent = Number(this.rent) || 0;
  const otherCharges = Number(this.otherCharges) || 0;
  const discount = Number(this.discount) || 0;
  const lateFee = Number(this.lateFee) || 0;

  this.totalAmount = Math.max(
    0,
    rent + otherCharges + lateFee - discount
  );
});

module.exports = mongoose.model("Billing", billingSchema);