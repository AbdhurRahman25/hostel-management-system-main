
const mongoose=require("mongoose");
const userSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 email:{type:String,required:true,unique:true,trim:true,lowercase:true},
 phone:{type:String,required:true,trim:true},
 passwordHash:{type:String,required:true,select:false},
 passwordSalt:{type:String,required:true,select:false},
 role:{type:String,enum:["Admin","Manager","Staff","Resident"],default:"Staff"},
 status:{type:String,enum:["Active","Inactive"],default:"Active"}
},{timestamps:true});
module.exports=mongoose.model("User",userSchema);
