import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Users, Server, HardDrive, Plus, Trash2, ExternalLink, ShieldCheck } from "lucide-react";
import { PLANS, LANGUAGES } from "../constants";
import { User, Server as ServerType, Node } from "../types";

export default function AdminDashboard() {
  return (
    <Routes>
      <Route path="/" element={<Overview />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/servers" element={<ServerManagement />} />
      <Route path="/nodes" element={<NodeManagement />} />
    </Routes>
  );
}

function Overview() {
  const [stats, setStats] = useState({ users: 0, servers: 0, nodes: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const [uRes, sRes, nRes] = await Promise.all([
        fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/servers", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/nodes", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ json: () => [] })),
      ]);
      const [u, s, n] = await Promise.all([uRes.json(), sRes.json(), nRes.json()]);
      setStats({ users: u.length, servers: s.length, nodes: n.length || 1 });
    };
    fetchData();
  }, []);

  const cards = [
    { name: "Total Users", value: stats.users, icon: Users, color: "text-blue-500" },
    { name: "Active Servers", value: stats.servers, icon: Server, color: "text-emerald-500" },
    { name: "Total Nodes", value: stats.nodes, icon: HardDrive, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Overview</h2>
        <p className="text-zinc-500">System-wide statistics and management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.name} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <card.icon className={`w-8 h-8 ${card.color}`} />
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Live</span>
            </div>
            <p className="text-4xl font-bold">{card.value}</p>
            <p className="text-zinc-500 text-sm mt-1">{card.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "", role: "user" });

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setUsers(await res.json());
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(formData),
    });
    setShowModal(false);
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-zinc-500">Manage panel administrators and regular users.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create User
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-950 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Username</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Email</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Created</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 font-medium">{user.username}</td>
                <td className="px-6 py-4 text-zinc-400">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-500 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-zinc-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">Create New User</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Username</label>
                <input
                  type="text"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500"
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Email</label>
                <input
                  type="email"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Password</label>
                <input
                  type="password"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 font-bold py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2 rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ServerManagement() {
  const [servers, setServers] = useState<ServerType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newServerInfo, setNewServerInfo] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    userId: "", 
    plan: "1GB", 
    language: "nodejs",
    serverUsername: "",
    startCommand: ""
  });

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const [sRes, uRes] = await Promise.all([
      fetch("/api/admin/servers", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    setServers(await sRes.json());
    setUsers(await uRes.json());
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/servers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    setNewServerInfo(data);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Server Management</h2>
          <p className="text-zinc-500">Deploy and manage application instances across nodes.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Server
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map((server) => (
          <div key={server.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                <Server className="w-5 h-5 text-emerald-500" />
              </div>
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${server.status === 'running' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-500/20 text-zinc-500'}`}>
                {server.status}
              </span>
            </div>
            <h3 className="text-lg font-bold mb-1">{server.name}</h3>
            <p className="text-zinc-500 text-sm mb-4">Owner: {server.owner_name}</p>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-zinc-950 p-2 rounded-lg text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-bold">RAM</p>
                <p className="text-sm font-bold">{server.memory}MB</p>
              </div>
              <div className="bg-zinc-950 p-2 rounded-lg text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-bold">CPU</p>
                <p className="text-sm font-bold">{server.cpu}vC</p>
              </div>
              <div className="bg-zinc-950 p-2 rounded-lg text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Disk</p>
                <p className="text-sm font-bold">{Math.round(server.disk / 1024)}GB</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                to={`/server/${server.id}`}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 rounded-lg text-center transition-colors"
              >
                Manage
              </Link>
              <a
                href={`/server/login/${server.id}`}
                target="_blank"
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 p-2 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {showModal && !newServerInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-6">Create New Server</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Server Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Owner</label>
                  <select
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500"
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  >
                    <option value="">Select User</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Server Username</label>
                  <input
                    type="text"
                    placeholder="Optional (auto-generated if empty)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500"
                    onChange={(e) => setFormData({ ...formData, serverUsername: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Start Command</label>
                  <input
                    type="text"
                    placeholder="e.g. node index.js"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500"
                    onChange={(e) => setFormData({ ...formData, startCommand: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Plan</label>
                  <select
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500"
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  >
                    {PLANS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Language</label>
                  <select
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500"
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  >
                    {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 font-bold py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2 rounded-lg transition-colors"
                >
                  Deploy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {newServerInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center gap-3 mb-6 text-emerald-500">
              <ShieldCheck className="w-8 h-8" />
              <h3 className="text-xl font-bold">Server Created!</h3>
            </div>
            <p className="text-zinc-400 text-sm mb-6">Please save these credentials. They will not be shown again.</p>
            
            <div className="space-y-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-6">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Server ID</p>
                <p className="text-sm font-mono text-white">{newServerInfo.id}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Username</p>
                <p className="text-sm font-mono text-white">{newServerInfo.serverUsername}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Password</p>
                <p className="text-sm font-mono text-emerald-500">{newServerInfo.serverPassword}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Access URL</p>
                <p className="text-xs font-mono text-blue-400 break-all">{window.location.origin}/server/login/{newServerInfo.id}</p>
              </div>
            </div>

            <button
              onClick={() => { setShowModal(false); setNewServerInfo(null); }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NodeManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Node Management</h2>
        <p className="text-zinc-500">Manage physical servers where application containers are hosted.</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center">
        <HardDrive className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
        <h3 className="text-lg font-bold">Local Node</h3>
        <p className="text-zinc-500 text-sm">Status: Online | Location: Localhost</p>
      </div>
    </div>
  );
}
