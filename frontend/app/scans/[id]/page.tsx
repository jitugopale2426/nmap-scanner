'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import HostTable from '@/components/HostTable';
import { statusColors } from '@/lib/constants';
import type { ScanJob, Host } from '@/lib/types';

export default function ScanDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [scan, setScan] = useState<ScanJob | null>(null);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchScan = async () => {
    try {
      const res = await api.getScanById(id as string);
      setScan(res.job);
      setHosts(res.hosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScan();
  }, [id]);

  // poll every 4s while the scan is still running
  useEffect(() => {
    if (!scan || scan.status !== 'running') return;
    const interval = setInterval(fetchScan, 4000);
    return () => clearInterval(interval);
  }, [scan?.status]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
          <div className="h-8 w-48 bg-gray-800 rounded animate-pulse" />
          <div className="h-32 bg-gray-800 rounded animate-pulse" />
          <div className="h-64 bg-gray-800 rounded animate-pulse" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/" className="text-blue-400 text-sm hover:underline">← Back to dashboard</Link>
        </div>
      </main>
    );
  }

  // by this point loading is false and no error — scan should be set
  if (!scan) return null;

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white text-sm transition-colors">
            ← Back
          </button>
          <span className="text-gray-600">/</span>
          <h1 className="text-xl font-semibold font-mono">{scan.target}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[scan.status]}`}>
            {scan.status}
          </span>
          {scan.status === 'running' && (
            <span className="text-blue-400 text-xs animate-pulse">Scanning...</span>
          )}
        </div>

        {/* scan meta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs">Hosts Found</p>
            <p className="text-white text-xl font-semibold mt-1">{hosts.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs">Open Ports</p>
            <p className="text-white text-xl font-semibold mt-1">
              {hosts.reduce((acc, h) => acc + h.ports.length, 0)}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs">Started</p>
            <p className="text-white text-sm mt-1">{new Date(scan.startedAt).toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs">Completed</p>
            <p className="text-white text-sm mt-1">
              {scan.completedAt ? new Date(scan.completedAt).toLocaleString() : '—'}
            </p>
          </div>
        </div>

        {/* error message if scan failed */}
        {scan.status === 'failed' && scan.error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
            <p className="text-red-400 text-sm">{scan.error}</p>
          </div>
        )}

        {/* hosts + ports */}
        <div className="bg-gray-800 rounded-lg p-6">
          <HostTable hosts={hosts} />
        </div>

      </div>
    </main>
  );
}
