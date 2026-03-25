import type { ScanJob, Host, Pagination, Stats } from '@/lib/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data as T;
}

export interface ScansResponse {
  data: ScanJob[];
  pagination: Pagination;
}

export interface ScanDetailResponse {
  job: ScanJob;
  hosts: Host[];
}

export interface StartScanResponse {
  jobId: string;
  status: string;
}

export const api = {
  startScan: (target: string) =>
    request<StartScanResponse>('/scanner/scan', {
      method: 'POST',
      body: JSON.stringify({ target })
    }),

  getScans: (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    return request<ScansResponse>(`/scanner/scans?${params.toString()}`);
  },

  getScanById: (id: string) =>
    request<ScanDetailResponse>(`/scanner/scans/${id}`),

  getScanStats: () =>
    request<Stats>('/scanner/scans/stats'),

  deleteScan: (id: string) =>
    request<{ success: boolean; message: string }>(`/scanner/scans/${id}`, { method: 'DELETE' })
};
