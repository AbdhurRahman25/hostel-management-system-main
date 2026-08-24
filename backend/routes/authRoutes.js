const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
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
   EMAIL CONFIGURATION
========================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =========================
   TEMPORARY OTP STORAGE
========================= */

const otpStore = new Map();

/* =========================
   EMAIL VALIDATION
========================= */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/* =========================
   SEND OTP
========================= */

router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Check whether email already exists
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // OTP expires after 5 minutes
    otpStore.set(cleanEmail, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: cleanEmail,
      subject: "Hostel Management - Email Verification OTP",
      text: `Your OTP for Hostel Management System registration is ${otp}. This OTP is valid for 5 minutes.`,
      html:` 
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2>Hostel Management System</h2>

          <p>Use the following OTP to verify your email address:</p>

          <div style="
            font-size:32px;
            font-weight:bold;
            letter-spacing:8px;
            padding:15px;
            background:#f1f5f9;
            display:inline-block;
            border-radius:10px;
          ">
            ${otp}
          </div>

          <p style="color:#64748b;">
            This OTP is valid for 5 minutes.
          </p>

          <p>If you did not request this OTP, please ignore this email.</p>
        </div>
      `,
    });

    res.json({
      success: true,
      message: "OTP sent successfully to your email",
    });

  } catch (error) {
    console.error("Send OTP error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

/* =========================
   VERIFY OTP
========================= */

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const savedOtp = otpStore.get(cleanEmail);

    if (!savedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP",
      });
    }

    if (Date.now() > savedOtp.expiresAt) {
      otpStore.delete(cleanEmail);

      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP",
      });
    }

    if (String(otp).trim() !== savedOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP verified
    otpStore.set(cleanEmail, {
      ...savedOtp,
      verified: true,
      verifiedAt: Date.now(),
    });

    res.json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    console.error("Verify OTP error:", error);

    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
});

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

    const role = "Resident"

    // Validate role
    // const allowedRoles = [
    //   "Admin",
    //   "Manager",
    //   "Staff",
    //   "Resident",
    // ];

    // if (!allowedRoles.includes(role)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid role",
    //   });
    // }

    // // Admin limit: maximum 1
    // if (role === "Admin") {
    //   const adminCount = await User.countDocuments({
    //     role: "Admin",
    //   });

    //   if (adminCount >= 1) {
    //     return res.status(403).json({
    //       success: false,
    //       message: "Only one Admin account is allowed",
    //     });
    //   }
    // }

    // // Manager limit: maximum 2
    // if (role === "Manager") {
    //   const managerCount = await User.countDocuments({
    //     role: "Manager",
    //   });

    //   if (managerCount >= 2) {
    //     return res.status(403).json({
    //       success: false,
    //       message: "Maximum 2 Manager accounts are allowed",
    //     });
    //   }
    // }
    


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

    // Check OTP verification
    const otpData = otpStore.get(cleanEmail);

    if (!otpData || !otpData.verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email with OTP first",
      });
    }

    // OTP verification should not be too old
    if (
      otpData.verifiedAt &&
      Date.now() - otpData.verifiedAt > 10 * 60 * 1000
    ) {
      otpStore.delete(cleanEmail);

      return res.status(403).json({
        success: false,
        message: "Email verification expired. Please verify again",
      });
    }

    // Check existing user
    if (await User.findOne({ email: cleanEmail })) {
      otpStore.delete(cleanEmail);

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

    // OTP can now be removed
    otpStore.delete(cleanEmail);

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