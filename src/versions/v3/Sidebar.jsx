import React from 'react';
import { getActionLabel } from '../../hooks/useSettings';

export default function Sidebar({ stats, settings }) {
  const directions = [
    { key: 'left', symbol: '←' },
    { key: 'up', symbol: '↑' },
    { key: 'right', symbol: '→' },
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-white flex items-stretch mb-4 select-none font-mono border-[3px] border-black">
      {directions.map((dir, i) => {
        const actionConfig = settings.swipeActions[dir.key];
        return (
          <React.Fragment key={dir.key}>
            {i > 0 && <div className="border-l-[2px] border-black/15" />}
            <div className="flex-1 flex items-center justify-center gap-2 py-3">
              <div className="w-3 h-3 flex-none" style={{ backgroundColor: actionConfig.color }} />
              <div className="flex flex-col">
                <span className="text-xl font-black text-black tabular-nums leading-none">
                  {stats[dir.key] || 0}
                </span>
                <span className="text-[9px] text-black/40 font-bold uppercase tracking-widest">
                  {getActionLabel(actionConfig).toUpperCase()}
                </span>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
