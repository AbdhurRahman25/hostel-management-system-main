
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../services/api";

export default function Login(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const navigate=useNavigate();

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault(); setLoading(true); setError("");
    try{
      const r=await fetch(`${API_URL}/api/auth/login`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password})
      });
      const data=await r.json();
      if(!r.ok) throw new Error(data.message||"Login failed");
      localStorage.setItem("hostel_token",data.token);
      localStorage.setItem("hostel_user",JSON.stringify(data.user));
      navigate("/");
    }catch(e){setError(e instanceof Error?e.message:"Login failed");}
    finally{setLoading(false);}
  };

  return <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
    <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
      <h1 className="text-3xl font-bold text-slate-800">Hostel Management</h1>
      <p className="mt-1 mb-6 text-slate-500">Sign in to your account</p>
      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</div>}
      <label className="mb-1 block text-sm font-medium">Email</label>
      <input className="mb-4 w-full rounded-lg border p-3" type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
      <label className="mb-1 block text-sm font-medium">Password</label>
      <input className="mb-6 w-full rounded-lg border p-3" type="password" required value={password} onChange={e=>setPassword(e.target.value)} />
      <button disabled={loading} className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{loading?"Signing in...":"Sign In"}</button>
      <p className="mt-5 text-center text-sm text-slate-500">New user? <Link className="font-semibold text-blue-600" to="/register">Create account</Link></p>
    </form>
  </div>;
}
