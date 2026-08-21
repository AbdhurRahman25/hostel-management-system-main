
const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema({
  billId:{type:mongoose.Schema.Types.ObjectId,ref:"Billing",required:true},
  residentName:{type:String,required:true},
  amount:{type:Number,required:true,min:0},
  gateway:{type:String,default:"Razorpay"},
  orderId:{type:String,default:null},
  paymentId:{type:String,default:null},
  status:{type:String,enum:["Created","Paid","Failed"],default:"Created"},
  paidAt:{type:Date,default:null}
},{timestamps:true});
module.exports=mongoose.model("Payment",paymentSchema);
