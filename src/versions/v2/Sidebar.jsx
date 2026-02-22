import React from 'react';
import { PackageOpen, Trash2, CheckSquare } from 'lucide-react';

export default function Sidebar({ stats }) {
  const { kept = 0, trashed = 0, archived = 0 } = stats || {};

  return (
    <div
      className="w-full max-w-md mx-auto bg-white p-4 flex items-center justify-around rounded-3xl mb-4 select-none"
      style={{ boxShadow: '0 8px 30px rgba(107,66,38,0.06)' }}
    >
      {/* Kept — sage green */}
      <div className="flex flex-col items-center">
        <div className="bg-[#a3b18a]/15 px-4 py-1.5 rounded-full mb-1">
          <span className="text-2xl font-bold text-[#a3b18a] flex items-center gap-1.5 tracking-wide">
            {kept} <CheckSquare className="w-5 h-5" />
          </span>
        </div>
        <span className="text-xs text-[#6b4226]/45 font-medium uppercase tracking-wider">Kept</span>
      </div>

      <div className="w-px h-10 bg-[#fdf6ee]"></div>

      {/* Archived — lavender */}
      <div className="flex flex-col items-center">
        <div className="bg-[#c8b6ff]/15 px-4 py-1.5 rounded-full mb-1">
          <span className="text-2xl font-bold text-[#c8b6ff] flex items-center gap-1.5 tracking-wide">
            {archived} <PackageOpen className="w-5 h-5" />
          </span>
        </div>
        <span className="text-xs text-[#6b4226]/45 font-medium uppercase tracking-wider">Archived</span>
      </div>

      <div className="w-px h-10 bg-[#fdf6ee]"></div>

      {/* Trashed — soft coral/peach */}
      <div className="flex flex-col items-center">
        <div className="bg-[#ffb88c]/15 px-4 py-1.5 rounded-full mb-1">
          <span className="text-2xl font-bold text-[#e8836a] flex items-center gap-1.5 tracking-wide">
            {trashed} <Trash2 className="w-5 h-5" />
          </span>
        </div>
        <span className="text-xs text-[#6b4226]/45 font-medium uppercase tracking-wider">Trashed</span>
      </div>
    </div>
  );
}
