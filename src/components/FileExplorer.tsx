import { useState, useEffect } from "react";
import { File, Folder, ChevronRight, MoreVertical, Upload, Plus, Trash2, Download, Edit3, Search, Copy, Archive } from "lucide-react";
import { FileInfo, Server } from "../types";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/theme-monokai";

export default function FileExplorer({ server }: { server: Server }) {
  const [path, setPath] = useState("");
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFile, setEditingFile] = useState<{ path: string; content: string } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const fetchFiles = async () => {
    setLoading(true);
    const res = await fetch(`/api/servers/${server.id}/files/list?path=${encodeURIComponent(path)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) setFiles(await res.json());
    setLoading(false);
    setSelectedFiles([]);
  };

  useEffect(() => { fetchFiles(); }, [path, server.id]);

  const handleFileClick = async (file: FileInfo) => {
    if (file.isDirectory) {
      setPath(prev => prev ? `${prev}/${file.name}` : file.name);
    } else {
      const res = await fetch(`/api/servers/${server.id}/files/read?path=${encodeURIComponent(path ? `${path}/${file.name}` : file.name)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setEditingFile({ path: path ? `${path}/${file.name}` : file.name, content: data.content });
    }
  };

  const handleSave = async () => {
    if (!editingFile) return;
    await fetch(`/api/servers/${server.id}/files/write`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ path: editingFile.path, content: editingFile.content }),
    });
    setEditingFile(null);
    fetchFiles();
  };

  const handleDelete = async (paths: string[]) => {
    if (!confirm(`Are you sure you want to delete ${paths.length} item(s)?`)) return;
    await fetch(`/api/servers/${server.id}/files/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ paths }),
    });
    fetchFiles();
  };

  const handleCompress = async (paths: string[]) => {
    const name = prompt("Enter archive name:", "archive.zip");
    if (!name) return;
    await fetch(`/api/servers/${server.id}/files/compress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ paths, name: path ? `${path}/${name}` : name }),
    });
    fetchFiles();
  };

  const handleDecompress = async (filePath: string) => {
    await fetch(`/api/servers/${server.id}/files/decompress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ path: filePath }),
    });
    fetchFiles();
  };

  const handleRename = async (oldPath: string) => {
    const newName = prompt("Enter new name:", oldPath.split("/").pop());
    if (!newName) return;
    const newPath = path ? `${path}/${newName}` : newName;
    await fetch(`/api/servers/${server.id}/files/move`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ from: oldPath, to: newPath }),
    });
    fetchFiles();
  };

  const handleDuplicate = async (oldPath: string) => {
    const nameParts = oldPath.split("/");
    const oldName = nameParts.pop()!;
    const newName = `copy_${oldName}`;
    const newPath = path ? `${path}/${newName}` : newName;
    await fetch(`/api/servers/${server.id}/files/copy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ from: oldPath, to: newPath }),
    });
    fetchFiles();
  };

  const toggleSelect = (fileName: string) => {
    const fullPath = path ? `${path}/${fileName}` : fileName;
    setSelectedFiles(prev => 
      prev.includes(fullPath) ? prev.filter(p => p !== fullPath) : [...prev, fullPath]
    );
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(f => path ? `${path}/${f.name}` : f.name));
    }
  };

  const breadcrumbs = path.split("/").filter(Boolean);

  if (editingFile) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-[600px]">
        <div className="bg-zinc-950 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <File className="w-5 h-5 text-emerald-500" />
            <span className="font-mono text-sm">{editingFile.path}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingFile(null)}
              className="px-4 py-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
        <div className="flex-1">
          <AceEditor
            mode="javascript"
            theme="monokai"
            value={editingFile.content}
            onChange={(val) => setEditingFile({ ...editingFile, content: val })}
            name="file-editor"
            width="100%"
            height="100%"
            fontSize={14}
            setOptions={{ useWorker: false }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
      <div className="bg-zinc-950 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => setPath("")} className="text-zinc-500 hover:text-white transition-colors">root</button>
          {breadcrumbs.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-zinc-700" />
              <button
                onClick={() => setPath(breadcrumbs.slice(0, i + 1).join("/"))}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                {b}
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {selectedFiles.length > 0 ? (
            <div className="flex items-center gap-2 mr-4 pr-4 border-r border-zinc-800">
              <span className="text-xs font-bold text-zinc-500 uppercase">{selectedFiles.length} selected</span>
              <button 
                onClick={() => handleCompress(selectedFiles)}
                className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors" title="Archive"
              >
                <Archive className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(selectedFiles)}
                className="p-2 text-zinc-400 hover:text-red-500 transition-colors" title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button className="p-2 text-zinc-400 hover:text-white transition-colors"><Search className="w-4 h-4" /></button>
              <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                New
              </button>
              <button className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                Upload
              </button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-zinc-950/50 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 w-10">
                <input 
                  type="checkbox" 
                  checked={selectedFiles.length === files.length && files.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500"
                />
              </th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Size</th>
              <th className="px-6 py-3">Modified</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {files.map((file) => {
              const fullPath = path ? `${path}/${file.name}` : file.name;
              const isSelected = selectedFiles.includes(fullPath);
              return (
                <tr
                  key={file.name}
                  className={cn(
                    "hover:bg-zinc-800/50 transition-colors cursor-pointer group",
                    isSelected && "bg-emerald-500/5"
                  )}
                >
                  <td className="px-6 py-4" onClick={(e) => { e.stopPropagation(); toggleSelect(file.name); }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="px-6 py-4" onClick={() => handleFileClick(file)}>
                    <div className="flex items-center gap-3">
                      {file.isDirectory ? (
                        <Folder className="w-5 h-5 text-blue-400 fill-blue-400/20" />
                      ) : (
                        <File className="w-5 h-5 text-zinc-400" />
                      )}
                      <span className="text-sm font-medium">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {file.isDirectory ? "-" : `${(file.size / 1024).toFixed(1)} KB`}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {new Date(file.mtime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {file.name.endsWith(".zip") && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDecompress(fullPath); }}
                          className="p-1.5 text-zinc-500 hover:text-emerald-500 transition-colors" title="Unarchive"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRename(fullPath); }}
                        className="p-1.5 text-zinc-500 hover:text-white transition-colors" title="Rename"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDuplicate(fullPath); }}
                        className="p-1.5 text-zinc-500 hover:text-blue-500 transition-colors" title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete([fullPath]); }}
                        className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors" title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-zinc-500 hover:text-emerald-500 transition-colors" title="Download"><Download className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {files.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic">
                  This directory is empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { RotateCcw } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
