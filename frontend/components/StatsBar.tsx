'use client';

import { useEffect } from 'react';
import { useScanStore } from '@/store/useScanStore';

export default function StatsBar() {
  const { stats, statsLoading, fetchStats } = useScanStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Scans', value: stats?.totalScans ?? 0 },
    { label: 'Hosts Discovered', value: stats?.totalHosts ?? 0 },
    { label: 'Open Ports', value: stats?.totalOpenPorts ?? 0 },
    { label: 'Completed', value: stats?.byStatus?.completed ?? 0 },
  ];

  if (statsLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-5 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map(card => (
        <div key={card.label} className="bg-gray-800 rounded-lg p-5">
          <p className="text-gray-400 text-sm">{card.label}</p>
          <p className="text-white text-2xl font-semibold mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
