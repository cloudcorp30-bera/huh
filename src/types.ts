export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Server {
  id: string;
  name: string;
  user_id: string;
  node_id: string;
  server_username: string;
  plan: string;
  memory: number;
  cpu: number;
  disk: number;
  language: string;
  start_command?: string;
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'installing';
  created_at: string;
  owner_name?: string;
}

export interface FileInfo {
  name: string;
  isDirectory: boolean;
  size: number;
  mtime: string;
  permissions: string;
}

export interface Node {
  id: string;
  name: string;
  hostname: string;
  port: number;
  status: 'online' | 'offline';
}
