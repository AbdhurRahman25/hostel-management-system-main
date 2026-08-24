
const express=require("express");
const crypto=require("crypto");
const User=require("../models/User");
const {auth,allowRoles}=require("../middleware/auth");
const router=express.Router();
router.use(auth);
router.use(allowRoles("Admin","Manager"));
const hash=(password,salt=crypto.randomBytes(16).toString("hex"))=>({passwordHash:crypto.scryptSync(password,salt,64).toString("hex"),passwordSalt:salt});

router.get("/",async(req,res)=>{try{const users=await User.find().sort({createdAt:-1});res.json({success:true,data:users});}catch(e){res.status(500).json({success:false,message:"Failed to fetch users",error:e.message});}});
router.post("/", async (req, res) => {
  try {
    const { role } = req.body;

    // Admin limit
    if (role === "Admin") {
      const adminCount = await User.countDocuments({
        role: "Admin",
      });

      if (adminCount >= 1) {
        return res.status(400).json({
          success: false,
          message: "Only one Admin account is allowed.",
        });
      }
    }

    // Manager limit
    if (role === "Manager") {
      const managerCount = await User.countDocuments({
        role: "Manager",
      });

      if (managerCount >= 2) {
        return res.status(400).json({
          success: false,
          message: "Only two Manager accounts are allowed.",
        });
      }
    }

    const p = hash(
      req.body.password || "Welcome@123"
    );

    const user = await User.create({
      ...req.body,
      ...p,
    });

    res.status(201).json({
      success: true,
      message: "User added successfully",
      data: user,
    });

  } catch (e) {
    res.status(400).json({
      success: false,
      message: "Failed to add user",
      error: e.message,
    });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const updates = { ...req.body };

    delete updates.passwordHash;
    delete updates.passwordSalt;

    // Check role change
    if (updates.role === "Admin") {
      const adminCount = await User.countDocuments({
        role: "Admin",
        _id: { $ne: req.params.id },
      });

      if (adminCount >= 1) {
        return res.status(400).json({
          success: false,
          message: "Only one Admin account is allowed.",
        });
      }
    }

    if (updates.role === "Manager") {
      const managerCount = await User.countDocuments({
        role: "Manager",
        _id: { $ne: req.params.id },
      });

      if (managerCount >= 2) {
        return res.status(400).json({
          success: false,
          message: "Only two Manager accounts are allowed.",
        });
      }
    }

    // Password handling
    if (updates.password) {
      Object.assign(
        updates,
        hash(updates.password)
      );

      delete updates.password;
    } else {
      delete updates.password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });

  } catch (e) {
    res.status(400).json({
      success: false,
      message: "Failed to update user",
      error: e.message,
    });
  }
});
router.delete("/:id",async(req,res)=>{try{const user=await User.findByIdAndDelete(req.params.id);if(!user)return res.status(404).json({success:false,message:"User not found"});res.json({success:true,message:"User deleted successfully"});}catch(e){res.status(500).json({success:false,message:"Failed to delete user"});}});
module.exports=router;
