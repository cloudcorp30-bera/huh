import { Link, useLocation, useParams } from "react-router-dom";
import { LayoutDashboard, Server, Users, HardDrive, FileCode, Terminal, Settings, Shield } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar({ user }: { user: any }) {
  const location = useLocation();
  const { serverId } = useParams();

  const isAdmin = user?.role === "admin";
  const isServerView = !!serverId;

  const adminLinks = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Servers", icon: Server, path: "/admin/servers" },
    { name: "Users", icon: Users, path: "/admin/users" },
    { name: "Nodes", icon: HardDrive, path: "/admin/nodes" },
  ];

  const serverLinks = [
    { name: "Console", icon: Terminal, path: `/server/${serverId}` },
    { name: "Files", icon: FileCode, path: `/server/${serverId}/files` },
    { name: "Databases", icon: HardDrive, path: `/server/${serverId}/databases` },
    { name: "Backups", icon: Shield, path: `/server/${serverId}/backups` },
    { name: "Settings", icon: Settings, path: `/server/${serverId}/settings` },
  ];

  const links = isServerView ? serverLinks : (isAdmin ? adminLinks : []);

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tighter text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Server className="text-zinc-950 w-5 h-5" />
          </div>
          BERA HOST
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
              location.pathname === link.path
                ? "bg-emerald-500/10 text-emerald-500"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            )}
          >
            <link.icon className="w-4 h-4" />
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
