import React from 'react';
import { PackageOpen, Trash2, CheckSquare } from 'lucide-react';

export default function Sidebar({ stats }) {
  const { kept = 0, trashed = 0, archived = 0 } = stats || {};

  return (
    <div className="w-full max-w-md mx-auto bg-[#1a1a2e]/80 backdrop-blur-xl p-4 flex items-center justify-around rounded-2xl border border-white/5 mb-4 select-none shadow-[0_0_20px_rgba(0,0,0,0.3)]">
      <div className="flex flex-col items-center">
        <span
          className="text-2xl font-bold text-green-400 flex items-center gap-1"
          style={{ textShadow: '0 0 10px rgba(34,197,94,0.4)' }}
        >
          {kept} <CheckSquare className="w-5 h-5" />
        </span>
        <span className="text-xs text-white/40 font-medium uppercase tracking-wider mt-1">Kept</span>
      </div>

      <div className="w-px h-10 bg-white/10"></div>

      <div className="flex flex-col items-center">
        <span
          className="text-2xl font-bold text-[#00d4ff] flex items-center gap-1"
          style={{ textShadow: '0 0 10px rgba(0,212,255,0.4)' }}
        >
          {archived} <PackageOpen className="w-5 h-5" />
        </span>
        <span className="text-xs text-white/40 font-medium uppercase tracking-wider mt-1">Archived</span>
      </div>

      <div className="w-px h-10 bg-white/10"></div>

      <div className="flex flex-col items-center">
        <span
          className="text-2xl font-bold text-[#ff2d7b] flex items-center gap-1"
          style={{ textShadow: '0 0 10px rgba(255,45,123,0.4)' }}
        >
          {trashed} <Trash2 className="w-5 h-5" />
        </span>
        <span className="text-xs text-white/40 font-medium uppercase tracking-wider mt-1">Trashed</span>
      </div>
    </div>
  );
}
