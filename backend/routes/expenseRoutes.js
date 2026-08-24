const express = require("express");
const Expense = require("../models/Expense");
const { auth, allowRoles } = require("../middleware/auth");

const router = express.Router();

// ================= GET ALL EXPENSES =================

router.get(
  "/",
  auth,
  allowRoles("Admin", "Manager"),
  async (req, res) => {
    try {
      const expenses = await Expense.find().sort({ date: -1 });

      res.json({
        success: true,
        data: expenses,
      });
    } catch (e) {
      console.error("Get expenses error:", e);

      res.status(500).json({
        success: false,
        message: "Failed to fetch expenses",
        error: e.message,
      });
    }
  }
);

// ================= CREATE EXPENSE =================

router.post(
  "/",
  auth,
  allowRoles("Admin", "Manager"),
  async (req, res) => {
    try {
      const { title, category, amount, description, date } = req.body;

      if (!title || !category || amount === undefined) {
        return res.status(400).json({
          success: false,
          message: "Title, category and amount are required",
        });
      }

      const expense = await Expense.create({
        title,
        category,
        amount,
        description,
        date,
      });

      res.status(201).json({
        success: true,
        message: "Expense created successfully",
        data: expense,
      });
    } catch (e) {
      console.error("Create expense error:", e);

      res.status(500).json({
        success: false,
        message: "Failed to create expense",
        error: e.message,
      });
    }
  }
);

// ================= UPDATE EXPENSE =================

router.put(
  "/:id",
  auth,
  allowRoles("Admin", "Manager"),
  async (req, res) => {
    try {
      const { title, category, amount, description, date } = req.body;

      const expense = await Expense.findByIdAndUpdate(
        req.params.id,
        {
          title,
          category,
          amount,
          description,
          date,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: "Expense not found",
        });
      }

      res.json({
        success: true,
        message: "Expense updated successfully",
        data: expense,
      });
    } catch (e) {
      console.error("Update expense error:", e);

      res.status(500).json({
        success: false,
        message: "Failed to update expense",
        error: e.message,
      });
    }
  }
);

// ================= DELETE EXPENSE =================

router.delete(
  "/:id",
  auth,
  allowRoles("Admin", "Manager"),
  async (req, res) => {
    try {
      const expense = await Expense.findByIdAndDelete(req.params.id);

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: "Expense not found",
        });
      }

      res.json({
        success: true,
        message: "Expense deleted successfully",
      });
    } catch (e) {
      console.error("Delete expense error:", e);

      res.status(500).json({
        success: false,
        message: "Failed to delete expense",
        error: e.message,
      });
    }
  }
);

module.exports = router;