import React from 'react';

export default function Sidebar({ stats }) {
  const { kept = 0, trashed = 0, archived = 0 } = stats || {};

  return (
    <div className="w-full max-w-md mx-auto bg-white flex items-stretch mb-4 select-none font-mono border-[3px] border-black">
      {/* Trashed — left (swipe left) */}
      <div className="flex-1 flex items-center justify-center gap-2 py-3">
        <div className="w-3 h-3 bg-[#ff0000] flex-none" />
        <div className="flex flex-col">
          <span className="text-xl font-black text-black tabular-nums leading-none">
            {trashed}
          </span>
          <span className="text-[9px] text-black/40 font-bold uppercase tracking-widest">TRASHED</span>
        </div>
      </div>

      <div className="border-l-[2px] border-black/15" />

      {/* Archived — center (swipe up) */}
      <div className="flex-1 flex items-center justify-center gap-2 py-3">
        <div className="w-3 h-3 bg-[#2563eb] flex-none" />
        <div className="flex flex-col">
          <span className="text-xl font-black text-black tabular-nums leading-none">
            {archived}
          </span>
          <span className="text-[9px] text-black/40 font-bold uppercase tracking-widest">ARCHIVED</span>
        </div>
      </div>

      <div className="border-l-[2px] border-black/15" />

      {/* Kept — right (swipe right) */}
      <div className="flex-1 flex items-center justify-center gap-2 py-3">
        <div className="w-3 h-3 bg-[#16a34a] flex-none" />
        <div className="flex flex-col">
          <span className="text-xl font-black text-black tabular-nums leading-none">
            {kept}
          </span>
          <span className="text-[9px] text-black/40 font-bold uppercase tracking-widest">KEPT</span>
        </div>
      </div>
    </div>
  );
}
