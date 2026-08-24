const express = require("express");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const Billing = require("../models/Billing");
const { auth, allowRoles } = require("../middleware/auth");

const router = express.Router();

/* =========================
   GET PAYMENTS
   Admin / Manager / Staff
========================= */

router.get(
  "/",
  auth,
  allowRoles("Admin", "Manager", "Staff"),
  async (req, res) => {
    try {
      const data = await Payment.find().sort({ createdAt: -1 });

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch payments",
        error: error.message,
      });
    }
  }
);

/* =========================
   CREATE PAYMENT ORDER
   Admin / Manager / Resident
========================= */

router.post(
  "/create-order",
  auth,
  allowRoles("Admin", "Manager", "Resident"),
  async (req, res) => {
    try {
      const { billId } = req.body;

      if (!billId) {
        return res.status(400).json({
          success: false,
          message: "Bill ID is required",
        });
      }

      const bill = await Billing.findById(billId);

      if (!bill) {
        return res.status(404).json({
          success: false,
          message: "Bill not found",
        });
      }

      if (bill.status === "Paid") {
        return res.status(400).json({
          success: false,
          message: "This bill has already been paid",
        });
      }

      /*
       * Use final amount.
       *
       * Formula:
       * rent + otherCharges + lateFee - discount
       */
      const calculatedTotal = Math.max(
        0,
        Number(bill.rent || 0) +
          Number(bill.otherCharges || 0) +
          Number(bill.lateFee || 0) -
          Number(bill.discount || 0)
      );

      // Keep database totalAmount synchronized
      if (Number(bill.totalAmount) !== calculatedTotal) {
        bill.totalAmount = calculatedTotal;
        await bill.save();
      }

      const amount = calculatedTotal * 100;

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Payment amount must be greater than zero",
        });
      }

      const key = process.env.RAZORPAY_KEY_ID;
      const secret = process.env.RAZORPAY_KEY_SECRET;

      let orderId = `demo_${Date.now()}`;

      /* =========================
         RAZORPAY ORDER
      ========================= */

      if (key && secret) {
        const authHeader = Buffer.from(
          `${key}:${secret}`
        ).toString("base64");

        const response = await fetch(
          "https://api.razorpay.com/v1/orders",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${authHeader}`,
            },

            body: JSON.stringify({
              amount,
              currency: "INR",
              receipt: `bill_${bill._id}`,

              notes: {
                billId: String(bill._id),
              },
            }),
          }
        );

        const order = await response.json();

        if (!response.ok) {
          return res.status(400).json({
            success: false,
            message:
              order.error?.description ||
              "Razorpay order failed",
          });
        }

        orderId = order.id;
      }

      /* =========================
         CREATE PAYMENT RECORD
      ========================= */

      const payment = await Payment.create({
        billId: bill._id,
        residentName: bill.residentName,
        amount: calculatedTotal,
        orderId,
      });

      res.json({
        success: true,

        // true = demo mode
        demo: !key || !secret,

        keyId: key || null,

        orderId,

        paymentId: payment._id,

        amount,

        currency: "INR",
      });
    } catch (error) {
      console.error("Create payment order error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to create payment order",
        error: error.message,
      });
    }
  }
);

/* =========================
   VERIFY PAYMENT
   Admin / Manager / Resident
========================= */

router.post(
  "/verify",
  auth,
  allowRoles("Admin", "Manager", "Resident"),
  async (req, res) => {
    try {
      const {
        paymentRecordId,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      } = req.body;

      if (!paymentRecordId) {
        return res.status(400).json({
          success: false,
          message: "Payment record ID is required",
        });
      }

      const record = await Payment.findById(
        paymentRecordId
      );

      if (!record) {
        return res.status(404).json({
          success: false,
          message: "Payment record not found",
        });
      }

      /* =========================
         VERIFY RAZORPAY SIGNATURE
      ========================= */

      const secret = process.env.RAZORPAY_KEY_SECRET;

      if (secret) {
        if (
          !razorpay_order_id ||
          !razorpay_payment_id ||
          !razorpay_signature
        ) {
          return res.status(400).json({
            success: false,
            message: "Payment verification data is incomplete",
          });
        }

        const expected = crypto
          .createHmac("sha256", secret)
          .update(
            `${razorpay_order_id}|${razorpay_payment_id}`
          )
          .digest("hex");

        if (expected !== razorpay_signature) {
          return res.status(400).json({
            success: false,
            message:
              "Payment signature verification failed",
          });
        }
      }

      /* =========================
         UPDATE PAYMENT
      ========================= */

      record.status = "Paid";

      record.paymentId =
        razorpay_payment_id ||
        `demo_${Date.now()}`;

      record.paidAt = new Date();

      await record.save();

      /* =========================
         UPDATE BILL
      ========================= */

      await Billing.findByIdAndUpdate(
        record.billId,
        {
          status: "Paid",
        }
      );

      res.json({
        success: true,
        message: "Payment completed",
        data: record,
      });
    } catch (error) {
      console.error("Payment verification error:", error);

      res.status(500).json({
        success: false,
        message: "Payment verification failed",
        error: error.message,
      });
    }
  }
);

module.exports = router;