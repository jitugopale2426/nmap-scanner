import { create } from 'zustand';
import { api } from '@/lib/api';
import type { ScanJob, Pagination, Stats } from '@/lib/types';

interface ScanStore {
  scans: ScanJob[];
  pagination: Pagination | null;
  stats: Stats | null;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;

  fetchScans: (page?: number, status?: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  startScan: (target: string) => Promise<{ jobId: string } | null>;
  deleteScan: (id: string) => Promise<void>;
}

export const useScanStore = create<ScanStore>((set, get) => ({
  scans: [],
  pagination: null,
  stats: null,
  loading: false,
  statsLoading: false,
  error: null,

  fetchScans: async (page = 1, status?) => {
    set({ loading: true, error: null });
    try {
      const res = await api.getScans(page, 10, status);
      set({ scans: res.data, pagination: res.pagination });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch scans' });
    } finally {
      set({ loading: false });
    }
  },

  fetchStats: async () => {
    set({ statsLoading: true });
    try {
      const stats = await api.getScanStats();
      set({ stats });
    } catch {
      // stats failing shouldn't break the whole page
    } finally {
      set({ statsLoading: false });
    }
  },

  startScan: async (target: string) => {
    try {
      const res = await api.startScan(target);
      // refresh list and stats after kicking off a scan
      get().fetchScans();
      get().fetchStats();
      return res;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to start scan' });
      return null;
    }
  },

  deleteScan: async (id: string) => {
    try {
      await api.deleteScan(id);
      // remove from local state immediately — no need to refetch
      set(state => ({
        scans: state.scans.filter(s => s._id !== id)
      }));
      get().fetchStats();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete scan' });
    }
  }
}));
