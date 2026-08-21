
import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
type Item={_id:string;title:string;message:string;type:string;isRead:boolean;createdAt:string};
export default function Notifications(){
 const [items,setItems]=useState<Item[]>([]);
 const load=()=>apiFetch("/api/notifications").then(r=>r.json()).then(d=>d.success&&setItems(d.data));
 useEffect(()=>{load()},[]);
 const read=async(id:string)=>{await apiFetch(`/api/notifications/${id}/read`,{method:"PUT"});load()};
 return <div className="min-h-screen bg-gray-100 p-6"><h1 className="mb-1 text-3xl font-bold">Notifications</h1><p className="mb-6 text-gray-500">Billing, maintenance and system alerts</p>
 <div className="space-y-3">{items.length===0?<div className="rounded-xl bg-white p-8 text-gray-500">No notifications yet.</div>:items.map(n=><div key={n._id} className={`rounded-xl bg-white p-5 shadow ${n.isRead?"opacity-60":""}`}><div className="flex justify-between gap-4"><div><h3 className="font-semibold">{n.title}</h3><p className="mt-1 text-gray-600">{n.message}</p><p className="mt-2 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p></div>{!n.isRead&&<button onClick={()=>read(n._id)} className="h-fit rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">Mark read</button>}</div></div>)}</div>
 </div>
}
