const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const residentRoutes = require("./routes/residentRoutes");
const roomRoutes = require("./routes/roomRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const billingRoutes = require("./routes/billingRoutes");
const usersRoutes = require("./routes/usersRoutes");
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reportRoutes = require("./routes/reportRoutes");

require("dotenv").config();


const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected successfully");
})
.catch((error) => {
    console.log("MongoDB connectin error:",error);
});

app.use("/api/residents", residentRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);

app.get("/",(req,res) => {
    res.json({
        message: "Hostel Management System API is running",
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT,() => {
    console.log(`Server running on http://localhost:${PORT}`);
});

