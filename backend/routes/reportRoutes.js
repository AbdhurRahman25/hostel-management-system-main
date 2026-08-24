
const express=require("express");
const Room=require("../models/Room");
const Resident=require("../models/Resident");
const Maintenance=require("../models/Maintenance");
const Billing=require("../models/Billing");
const Payment=require("../models/Payment");
const {auth,allowRoles}=require("../middleware/auth");
const router=express.Router();

router.get("/summary",auth,allowRoles("Admin","Manager"),async(req,res)=>{
  try{
    const [rooms,residents,maintenance,bills,payments]=await Promise.all([
      Room.find(),Resident.find(),Maintenance.find(),Billing.find(),Payment.find({status:"Paid"})
    ]);
    const totalRooms=rooms.length;
    const capacity=rooms.reduce((n,r)=>n+r.capacity,0);
    const occupied=rooms.reduce((n,r)=>n+r.occupied,0);
    const totalBilling=bills.reduce((n,b)=>n+b.rent+b.otherCharges,0);
    const collected=payments.reduce((n,p)=>n+p.amount,0);
    const pending=totalBilling-collected;
    const byMonth={};
    bills.forEach(b=>{const key=new Date(b.createdAt).toLocaleString("en-IN",{month:"short",year:"numeric"});byMonth[key]=(byMonth[key]||0)+b.rent+b.otherCharges;});
    res.json({success:true,data:{
      totalRooms,capacity,occupied,availableBeds:Math.max(0,capacity-occupied),
      occupancyRate:capacity?Math.round(occupied/capacity*100):0,
      activeResidents:residents.filter(r=>r.status==="Active").length,
      totalBilling,collected,pending:Math.max(0,pending),
      maintenanceTotal:maintenance.length,
      maintenancePending:maintenance.filter(m=>m.status!=="Completed").length,
      maintenanceCompleted:maintenance.filter(m=>m.status==="Completed").length,
      monthlyRevenue:Object.entries(byMonth).map(([month,amount])=>({month,amount}))
    }});
  }catch(e){res.status(500).json({success:false,message:"Report generation failed",error:e.message});}
});
module.exports=router;
