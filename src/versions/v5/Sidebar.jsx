import React from 'react';

export default function Sidebar({ stats }) {
  const { kept = 0, trashed = 0, archived = 0 } = stats || {};

  return (
    <div
      className="w-full max-w-md mx-auto bg-[#faf8f2] border border-[#1a1a1a]/15 p-4 flex items-center justify-around mb-4 select-none"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-[#1a1a1a]">
          {kept}
        </span>
        <span className="uppercase tracking-[0.15em] text-xs font-semibold text-[#1a1a1a]/50 mt-1">
          Kept
        </span>
      </div>

      {/* Thin vertical rule */}
      <div className="w-px h-10 bg-[#1a1a1a]/15" />

      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-[#1a1a1a]">
          {archived}
        </span>
        <span className="uppercase tracking-[0.15em] text-xs font-semibold text-[#1a1a1a]/50 mt-1">
          Archived
        </span>
      </div>

      {/* Thin vertical rule */}
      <div className="w-px h-10 bg-[#1a1a1a]/15" />

      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-[#1a1a1a]">
          {trashed}
        </span>
        <span className="uppercase tracking-[0.15em] text-xs font-semibold text-[#1a1a1a]/50 mt-1">
          Trashed
        </span>
      </div>
    </div>
  );
}
