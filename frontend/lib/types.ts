export interface Port {
  port: number;
  protocol: string;
  state: string;
  service: string;
}

export interface Host {
  _id: string;
  ip: string;
  hostname: string | null;
  status: string;
  ports: Port[];
  scannedAt: string;
}

export interface ScanJob {
  _id: string;
  target: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Stats {
  totalScans: number;
  totalHosts: number;
  totalOpenPorts: number;
  byStatus: Record<string, number>;
}
