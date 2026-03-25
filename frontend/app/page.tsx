'use client';

import StatsBar from '@/components/StatsBar';
import ScanForm from '@/components/ScanForm';
import ScanList from '@/components/ScanList';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Network Scanner</h1>
          <p className="text-gray-400 text-sm mt-1">
            Discover hosts and open ports on your network using Nmap
          </p>
        </div>

        <StatsBar />
        <ScanForm />
        <ScanList />
      </div>
    </main>
  );
}
