const express = require("express");
const crypto = require("crypto");
const User = require("../models/User");
const { sign } = require("../middleware/auth");

const router = express.Router();

/* =========================
   PASSWORD FUNCTIONS
========================= */

function hashPassword(
  password,
  salt = crypto.randomBytes(16).toString("hex")
) {
  const passwordHash = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");

  return { passwordHash, salt };
}

function validPassword(password, user) {
  const hash = crypto
    .scryptSync(password, user.passwordSalt, 64)
    .toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(user.passwordHash, "hex")
  );
}

/* =========================
   EMAIL VALIDATION
========================= */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/* =========================
   REGISTER
========================= */

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    // Public registration always creates Resident
    const role = "Resident";

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Check existing user
    if (await User.findOne({ email: cleanEmail })) {

      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Phone validation
    const cleanPhone = String(phone).replace(/\s/g, "");

    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain exactly 10 digits",
      });
    }

    const { passwordHash, salt } = hashPassword(password);

    await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      role,
      passwordHash,
      passwordSalt: salt,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
    });

  } catch (e) {
    console.error("Registration error:", e);

    res.status(400).json({
      success: false,
      message: "Registration failed",
      error: e.message,
    });
  }
});

/* =========================
   LOGIN
========================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select("+passwordHash +passwordSalt");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = validPassword(password, user);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    const token = sign({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 86400,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (e) {
    console.error("Login error:", e);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

module.exports = router;