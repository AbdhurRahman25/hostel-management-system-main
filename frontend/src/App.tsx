
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Residents from "./pages/Residents";
import Rooms from "./pages/Rooms";
import Maintenance from "./pages/Maintenance";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Notifications from "./pages/Notifications";
import Login from "./pages/Login";
import Register from "./pages/Register";

function Protected({children}:{children:React.ReactNode}){
  return localStorage.getItem("hostel_token") ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
 return <BrowserRouter>
  <Routes>
   <Route path="/login" element={<Login/>}/>
   <Route path="/register" element={<Register/>}/>
   <Route path="*" element={<Protected><div className="flex min-h-screen bg-gray-100"><Sidebar/><main className="flex-1"><Routes>
    <Route path="/" element={<Dashboard/>}/><Route path="/residents" element={<Residents/>}/><Route path="/rooms" element={<Rooms/>}/>
    <Route path="/maintenance" element={<Maintenance/>}/><Route path="/billing" element={<Billing/>}/><Route path="/reports" element={<Reports/>}/><Route path="/users" element={<Users/>}/><Route path="/notifications" element={<Notifications/>}/>
   </Routes></main></div></Protected>}/>
  </Routes>
 </BrowserRouter>;
}
export default App;
