const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("../models/User");

require("dotenv").config();

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
    const passwordHash = crypto
        .scryptSync(password, salt, 64)
        .toString("hex");

    return {
        passwordHash,
        passwordSalt: salt,
    };
}

const demoUsers = [
    {
        name: "Demo Admin",
        email: "demo.admin@hostel.com",
        phone: "9000000001",
        password: "Admin@123",
        role: "Admin",
    },
    {
        name: "Demo Manager",
        email: "demo.manager@hostel.com",
        phone: "9000000002",
        password: "Manager@123",
        role: "Manager",
    },
    {
        name: "Demo Staff",
        email: "demo.staff@hostel.com",
        phone: "9000000003",
        password: "Staff@123",
        role: "Staff",
    },
    {
        name: "Demo Resident",
        email: "demo.resident@hostel.com",
        phone: "9000000004",
        password: "Resident@123",
        role: "Resident",
    },
];

async function createDemoUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        for (const demoUser of demoUsers) {
            const existingUser = await User.findOne({
                email: demoUser.email,
            });

            if (existingUser) {
                console.log(
                    `${demoUser.role} demo account already exists: ${demoUser.email}`
                );
                continue;
            }

            const { passwordHash, passwordSalt } = hashPassword(
                demoUser.password
            );

            await User.create({
                name: demoUser.name,
                email: demoUser.email,
                phone: demoUser.phone,
                passwordHash,
                passwordSalt,
                role: demoUser.role,
                status: "Active",
            });

            console.log(
                `${demoUser.role} demo account created: ${demoUser.email}`
            );
        }

        console.log("Demo user creation completed.");

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Error creating demo users:", error);

        await mongoose.disconnect();
        process.exit(1);
    }
}

createDemoUsers();