
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../services/api";

export default function Register(){
 const [form,setForm]=useState({name:"",email:"",phone:"",password:"",role:"Resident"});
 const [error,setError]=useState(""); const navigate=useNavigate();
 const change=(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement>)=>setForm({...form,[e.target.name]:e.target.value});
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setError("");
  try{const r=await fetch(`${API_URL}/api/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const d=await r.json();if(!r.ok)throw new Error(d.message);navigate("/login");}catch(e){setError(e instanceof Error?e.message:"Registration failed");}
 };
 return <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4"><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
  <h1 className="mb-6 text-2xl font-bold">Create Account</h1>{error&&<div className="mb-4 rounded bg-red-50 p-3 text-red-700">{error}</div>}
  {["name","email","phone","password"].map(k=><div key={k} className="mb-4"><label className="mb-1 block text-sm capitalize">{k}</label><input name={k} type={k==="password"?"password":k==="email"?"email":"text"} required className="w-full rounded-lg border p-3" value={form[k as keyof typeof form]} onChange={change}/></div>)}
  <label className="mb-1 block text-sm">Role</label><select name="role" className="mb-6 w-full rounded-lg border p-3" value={form.role} onChange={change}><option>Resident</option><option>Staff</option><option>Manager</option><option>Admin</option></select>
  <button className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white">Create Account</button><p className="mt-4 text-center text-sm">Already registered? <Link className="text-blue-600" to="/login">Login</Link></p>
 </form></div>;
}
