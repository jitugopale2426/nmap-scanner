'use client';

import { useState } from 'react';
import type { Host } from '@/lib/types';

interface Props {
  hosts: Host[];
}

export default function HostTable({ hosts }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = hosts.filter(h =>
    h.ip.includes(search) || h.hostname?.toLowerCase().includes(search.toLowerCase())
  );

  if (hosts.length === 0) {
    return <p className="text-gray-500 text-sm mt-4">No hosts discovered.</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-lg font-medium">Discovered Hosts</h2>
        <input
          type="text"
          placeholder="Filter by IP or hostname..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-gray-700 text-white placeholder-gray-400 text-sm rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-500 text-sm py-4">No hosts match your search.</p>
      )}

      <div className="space-y-3">
        {filtered.map(host => (
          <div key={host._id} className="bg-gray-700 rounded-lg overflow-hidden">
            {/* host row */}
            <button
              onClick={() => setExpanded(expanded === host._id ? null : host._id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className={`w-2 h-2 rounded-full ${host.status === 'up' ? 'bg-green-400' : 'bg-gray-500'}`} />
                <span className="text-white font-mono text-sm">{host.ip}</span>
                {host.hostname && (
                  <span className="text-gray-400 text-xs">{host.hostname}</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-xs">{host.ports.length} open port{host.ports.length !== 1 ? 's' : ''}</span>
                <span className="text-gray-500 text-xs">{expanded === host._id ? '▲' : '▼'}</span>
              </div>
            </button>

            {/* ports table — shown on expand */}
            {expanded === host._id && host.ports.length > 0 && (
              <div className="border-t border-gray-600">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase">
                      <th className="text-left px-4 py-2">Port</th>
                      <th className="text-left px-4 py-2">Protocol</th>
                      <th className="text-left px-4 py-2">State</th>
                      <th className="text-left px-4 py-2">Service</th>
                    </tr>
                  </thead>
                  <tbody>
                    {host.ports.map((p, i) => (
                      <tr key={i} className="border-t border-gray-600 hover:bg-gray-600 transition-colors">
                        <td className="px-4 py-2 text-blue-400 font-mono">{p.port}</td>
                        <td className="px-4 py-2 text-gray-300">{p.protocol}</td>
                        <td className="px-4 py-2">
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                            {p.state}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-300">{p.service || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {expanded === host._id && host.ports.length === 0 && (
              <p className="text-gray-500 text-xs px-4 py-3 border-t border-gray-600">No open ports found.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
