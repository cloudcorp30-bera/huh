import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ServerDashboard from "./pages/ServerDashboard";
import Layout from "./components/Layout";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/server/login/:serverId" element={<Login setUser={setUser} isServerLogin />} />
        
        <Route element={<Layout user={user} setUser={setUser} />}>
          <Route path="/admin/*" element={user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/server/:serverId/*" element={user ? <ServerDashboard /> : <Navigate to="/login" />} />
          <Route path="/" element={user?.role === "admin" ? <Navigate to="/admin" /> : <Navigate to="/login" />} />
        </Route>
      </Routes>
    </Router>
  );
}
