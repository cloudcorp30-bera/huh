import { LogOut, Bell, Search } from "lucide-react";

export default function Navbar({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <header className="h-16 bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search servers, files, users..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-zinc-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="h-4 w-[1px] bg-zinc-800 mx-2" />
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
