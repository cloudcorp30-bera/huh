import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { Server } from "../types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Console({ server }: { server: Server }) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      theme: {
        background: "#09090b",
        foreground: "#e4e4e7",
        cursor: "#10b981",
        selectionBackground: "#10b98133",
      },
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 13,
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const token = localStorage.getItem("token");
    const ws = new WebSocket(`${protocol}//${window.location.host}?serverId=${server.id}&token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "output") {
        term.write(msg.data);
      } else if (msg.type === "stats") {
        setStats(prev => [...prev.slice(-19), { time: new Date().toLocaleTimeString(), ...msg.data }]);
      }
    };

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "input", data }));
      }
    });

    const handleResize = () => fitAddon.fit();
    window.addEventListener("resize", handleResize);

    return () => {
      ws.close();
      term.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [server.id]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
        <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Terminal Console</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500/50" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
          </div>
        </div>
        <div ref={terminalRef} className="flex-1 p-2" />
      </div>

      <div className="space-y-6">
        <StatCard title="CPU Usage" data={stats} dataKey="cpu" color="#10b981" unit="%" />
        <StatCard title="Memory Usage" data={stats} dataKey="memory" color="#3b82f6" unit="MB" />
        <StatCard title="Disk Usage" data={stats} dataKey="disk" color="#a855f7" unit="MB" />
      </div>
    </div>
  );
}

function StatCard({ title, data, dataKey, color, unit }: any) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl h-[180px] flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{title}</h4>
        <span className="text-sm font-bold" style={{ color }}>
          {data[data.length - 1]?.[dataKey]?.toFixed(1) || 0}{unit}
        </span>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey={dataKey} stroke={color} fillOpacity={1} fill={`url(#color${dataKey})`} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
