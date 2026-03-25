'use client';

import { useState } from 'react';
import { useScanStore } from '@/store/useScanStore';

export default function ScanForm() {
  const [target, setTarget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { startScan } = useScanStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!target.trim()) {
      setError('Please enter a target');
      return;
    }

    setSubmitting(true);
    const res = await startScan(target.trim());
    setSubmitting(false);

    if (res?.jobId) {
      setSuccess(`Scan started — Job ID: ${res.jobId}`);
      setTarget('');
    } else {
      setError('Failed to start scan. Check the target and try again.');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8">
      <h2 className="text-white text-lg font-medium mb-4">New Scan</h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={target}
          onChange={e => setTarget(e.target.value)}
          placeholder="e.g. 192.168.1.0/24 or 192.168.1.1"
          className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2 rounded-md transition-colors"
        >
          {submitting ? 'Starting...' : 'Run Scan'}
        </button>
      </form>

      {success && <p className="mt-3 text-green-400 text-sm">{success}</p>}
      {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
    </div>
  );
}
