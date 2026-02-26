import { useState, useEffect } from "react";
import { Routes, Route, useParams, Link, useLocation } from "react-router-dom";
import { Terminal, FileCode, HardDrive, Shield, Settings, Play, Square, RotateCcw } from "lucide-react";
import Console from "../components/Console";
import FileExplorer from "../components/FileExplorer";
import { Server } from "../types";

export default function ServerDashboard() {
  const { serverId } = useParams();
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServer = async () => {
      const res = await fetch(`/api/servers/${serverId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) setServer(await res.json());
      setLoading(false);
    };
    fetchServer();
  }, [serverId]);

  const handlePowerAction = async (action: "start" | "stop" | "restart") => {
    const res = await fetch(`/api/servers/${serverId}/power`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      // Refresh server status
      const sRes = await fetch(`/api/servers/${serverId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (sRes.ok) setServer(await sRes.json());
    }
  };

  if (loading) return <div className="text-zinc-500">Loading server...</div>;
  if (!server) return <div className="text-red-500">Server not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold">{server.name}</h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${server.status === 'running' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-500/20 text-zinc-500'}`}>
              {server.status}
            </span>
          </div>
          <p className="text-zinc-500 text-sm font-mono">{server.id}</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => handlePowerAction("start")}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
          <button 
            onClick={() => handlePowerAction("restart")}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
          <button 
            onClick={() => handlePowerAction("stop")}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
          >
            <Square className="w-4 h-4" />
            Stop
          </button>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Console server={server} />} />
        <Route path="/files/*" element={<FileExplorer server={server} />} />
        <Route path="/databases" element={<Placeholder title="Databases" />} />
        <Route path="/backups" element={<Placeholder title="Backups" />} />
        <Route path="/settings" element={<SettingsTab server={server} setServer={setServer} />} />
      </Routes>
    </div>
  );
}

function SettingsTab({ server, setServer }: { server: Server; setServer: (s: Server) => void }) {
  const [startCommand, setStartCommand] = useState(server.start_command || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/servers/${server.id}/settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ startCommand }),
    });
    if (res.ok) {
      setServer({ ...server, start_command: startCommand });
      alert("Settings saved successfully!");
    }
    setSaving(false);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-2xl">
      <h3 className="text-xl font-bold mb-6">Server Settings</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Start Command</label>
          <input
            type="text"
            value={startCommand}
            onChange={(e) => setStartCommand(e.target.value)}
            placeholder="e.g. node index.js"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500 font-mono text-sm"
          />
          <p className="text-xs text-zinc-500 mt-2">
            This command is executed when the server starts. If empty, the default command for the selected language will be used.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-zinc-500">This feature is coming soon to Bera Host.</p>
    </div>
  );
}
