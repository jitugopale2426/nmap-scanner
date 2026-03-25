'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useScanStore } from '@/store/useScanStore';
import { statusColors } from '@/lib/constants';

export default function ScanList() {
  const { scans, pagination, loading, error, fetchScans, deleteScan } = useScanStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchScans(page, statusFilter || undefined);
  }, [page, statusFilter]);

  // auto-refresh every 5s if any scan on the current page is still running
  useEffect(() => {
    const hasRunning = scans.some(s => s.status === 'running' || s.status === 'pending');
    if (!hasRunning) return;
    const interval = setInterval(() => fetchScans(page, statusFilter || undefined), 5000);
    return () => clearInterval(interval);
  }, [scans, page, statusFilter]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); // prevent Link navigation from firing
    if (!confirm('Delete this scan?')) return;
    await deleteScan(id);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-lg font-medium">Scan History</h2>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-gray-700 text-gray-300 text-sm rounded-md px-3 py-1.5 outline-none"
        >
          <option value="">All</option>
          <option value="completed">Completed</option>
          <option value="running">Running</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {!loading && !error && scans.length === 0 && (
        <p className="text-gray-500 text-sm">No scans yet. Run one above.</p>
      )}

      {!loading && scans.length > 0 && (
        <div className="space-y-2">
          {scans.map(scan => (
            <Link
              key={scan._id}
              href={`/scans/${scan._id}`}
              className="flex items-center justify-between bg-gray-700 hover:bg-gray-600 rounded-md px-4 py-3 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[scan.status]}`}>
                  {scan.status}
                </span>
                <span className="text-white text-sm font-mono">{scan.target}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-xs">
                  {new Date(scan.startedAt).toLocaleString()}
                </span>
                <button
                  onClick={e => handleDelete(e, scan._id)}
                  className="text-gray-500 hover:text-red-400 text-xs transition-colors opacity-0 group-hover:opacity-100"
                >
                  Delete
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
          <span className="text-gray-400 text-xs">
            {pagination.total} total · page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white rounded-md transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page === pagination.totalPages}
              className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white rounded-md transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
