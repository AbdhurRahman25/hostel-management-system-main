
const express = require("express");
const Notification = require("../models/Notification");
const { auth,allowRoles } = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, async (req,res)=>{
  const items = await Notification.find({
    $or:[{userId:req.user.id},{userId:null}]
  }).sort({createdAt:-1}).limit(50);
  res.json({success:true,data:items});
});
router.put("/:id/read", auth, async (req,res)=>{
  const item = await Notification.findOneAndUpdate(
    {_id:req.params.id,$or:[{userId:req.user.id},{userId:null}]},
    {isRead:true},{new:true}
  );
  if(!item) return res.status(404).json({success:false,message:"Notification not found"});
  res.json({success:true,data:item});
});
router.post("/", auth,allowRoles("Admin","Manager","Staff"), async (req,res)=>{
  const item=await Notification.create(req.body);
  res.status(201).json({success:true,data:item});
});
module.exports=router;
