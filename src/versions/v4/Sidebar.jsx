import React from 'react';
import { PackageOpen, Trash2, CheckSquare } from 'lucide-react';

export default function Sidebar({ stats }) {
  const { kept = 0, trashed = 0, archived = 0 } = stats || {};

  return (
    <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-xl p-4 flex items-center justify-around rounded-2xl border border-white/20 mb-4 select-none">
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-white flex items-center gap-1">
          {kept} <CheckSquare className="w-5 h-5 text-white/60" />
        </span>
        <span className="text-xs text-white/50 font-medium uppercase tracking-wider mt-1">Kept</span>
      </div>

      <div className="w-px h-10 bg-white/10"></div>

      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-white flex items-center gap-1">
          {archived} <PackageOpen className="w-5 h-5 text-white/60" />
        </span>
        <span className="text-xs text-white/50 font-medium uppercase tracking-wider mt-1">Archived</span>
      </div>

      <div className="w-px h-10 bg-white/10"></div>

      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-white flex items-center gap-1">
          {trashed} <Trash2 className="w-5 h-5 text-white/60" />
        </span>
        <span className="text-xs text-white/50 font-medium uppercase tracking-wider mt-1">Trashed</span>
      </div>
    </div>
  );
}
