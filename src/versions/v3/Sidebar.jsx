import React from 'react';

export default function Sidebar({ stats }) {
  const { kept = 0, trashed = 0, archived = 0 } = stats || {};

  return (
    <div className="w-full max-w-md mx-auto bg-white p-4 flex items-center justify-around mb-4 select-none font-mono">
      <div className="flex flex-col items-center">
        <span className="text-3xl font-black text-black tabular-nums">
          {kept}
        </span>
        <span className="text-[10px] text-black font-bold uppercase tracking-widest mt-1">KEPT</span>
      </div>

      <div className="border-l-[3px] border-black h-12"></div>

      <div className="flex flex-col items-center">
        <span className="text-3xl font-black text-black tabular-nums">
          {archived}
        </span>
        <span className="text-[10px] text-black font-bold uppercase tracking-widest mt-1">ARCHIVED</span>
      </div>

      <div className="border-l-[3px] border-black h-12"></div>

      <div className="flex flex-col items-center">
        <span className="text-3xl font-black text-black tabular-nums">
          {trashed}
        </span>
        <span className="text-[10px] text-black font-bold uppercase tracking-widest mt-1">TRASHED</span>
      </div>
    </div>
  );
}
