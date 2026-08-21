
const express=require("express");
const crypto=require("crypto");
const Payment=require("../models/Payment");
const Billing=require("../models/Billing");
const {auth}=require("../middleware/auth");
const router=express.Router();

router.get("/",auth,async(req,res)=>{
  const data=await Payment.find().sort({createdAt:-1});
  res.json({success:true,data});
});

router.post("/create-order",auth,async(req,res)=>{
  try{
    const {billId}=req.body;
    const bill=await Billing.findById(billId);
    if(!bill) return res.status(404).json({success:false,message:"Bill not found"});
    const amount=(bill.rent+bill.otherCharges)*100;
    const key=process.env.RAZORPAY_KEY_ID, secret=process.env.RAZORPAY_KEY_SECRET;
    let orderId=`demo_${Date.now()}`;
    if(key && secret){
      const authHeader=Buffer.from(`${key}:${secret}`).toString("base64");
      const r=await fetch("https://api.razorpay.com/v1/orders",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Basic ${authHeader}`},
        body:JSON.stringify({amount,currency:"INR",receipt:`bill_${bill._id}`,notes:{billId:String(bill._id)}})
      });
      const order=await r.json();
      if(!r.ok) return res.status(400).json({success:false,message:order.error?.description||"Razorpay order failed"});
      orderId=order.id;
    }
    const payment=await Payment.create({
      billId:bill._id,residentName:bill.residentName,amount:amount/100,orderId
    });
    res.json({success:true,demo:!key||!secret,keyId:key||null,orderId,paymentId:payment._id,amount,currency:"INR"});
  }catch(e){res.status(500).json({success:false,message:"Unable to create payment order",error:e.message});}
});

router.post("/verify",auth,async(req,res)=>{
  try{
    const {paymentRecordId,razorpay_payment_id,razorpay_order_id,razorpay_signature}=req.body;
    const record=await Payment.findById(paymentRecordId);
    if(!record) return res.status(404).json({success:false,message:"Payment record not found"});
    const secret=process.env.RAZORPAY_KEY_SECRET;
    if(secret){
      const expected=crypto.createHmac("sha256",secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
      if(expected!==razorpay_signature) return res.status(400).json({success:false,message:"Payment signature verification failed"});
    }
    record.status="Paid"; record.paymentId=razorpay_payment_id||`demo_${Date.now()}`; record.paidAt=new Date(); await record.save();
    await Billing.findByIdAndUpdate(record.billId,{status:"Paid"});
    res.json({success:true,message:"Payment completed",data:record});
  }catch(e){res.status(500).json({success:false,message:"Payment verification failed"});}
});
module.exports=router;
