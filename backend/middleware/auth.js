
const crypto = require("crypto");

function base64url(input){ return Buffer.from(input).toString("base64").replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_"); }
function sign(payload){
  const body=base64url(JSON.stringify(payload));
  const secret=process.env.JWT_SECRET || "development-secret-change-me";
  const sig=crypto.createHmac("sha256",secret).update(body).digest("base64").replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
  return `${body}.${sig}`;
}
function verify(token){
  const [body,sig]=String(token).split(".");
  if(!body||!sig) throw new Error("Invalid token");
  const secret=process.env.JWT_SECRET || "development-secret-change-me";
  const expected=crypto.createHmac("sha256",secret).update(body).digest("base64").replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
  if(sig!==expected) throw new Error("Invalid signature");
  const payload=JSON.parse(Buffer.from(body.replace(/-/g,"+").replace(/_/g,"/"),"base64").toString());
  if(payload.exp && Date.now()>payload.exp*1000) throw new Error("Expired token");
  return payload;
}
const auth=(req,res,next)=>{
 const header=req.headers.authorization||"";
 const token=header.startsWith("Bearer ")?header.slice(7):null;
 if(!token)return res.status(401).json({success:false,message:"Authentication required"});
 try{req.user=verify(token);next();}catch{return res.status(401).json({success:false,message:"Invalid or expired token"});}
};
const allowRoles=(...roles)=>(req,res,next)=>{
 if(!req.user||!roles.includes(req.user.role))return res.status(403).json({success:false,message:"You do not have permission for this action"});
 next();
};
module.exports={auth,allowRoles,sign};
