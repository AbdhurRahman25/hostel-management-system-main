
const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
  userId: { type:mongoose.Schema.Types.ObjectId, ref:"User", default:null },
  title: { type:String, required:true },
  message: { type:String, required:true },
  type: { type:String, enum:["maintenance","billing","room","system"], default:"system" },
  isRead: { type:Boolean, default:false }
}, {timestamps:true});
module.exports = mongoose.model("Notification", notificationSchema);
