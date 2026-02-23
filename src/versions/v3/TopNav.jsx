import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

// Segmented progress bar — Casio bit-display style
// Fills in discrete blocks instead of a smooth bar
function SegmentedProgress({ percent }) {
  const totalSegments = 8;
  const filled = Math.round((percent / 100) * totalSegments);

  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: totalSegments }).map((_, i) => (
        <div
          key={i}
          className="w-[6px] h-[10px]"
          style={{
            backgroundColor: i < filled ? '#ca8a04' : 'rgba(0,0,0,0.08)',
            transition: 'background-color 0.15s step-end',
          }}
        />
      ))}
    </div>
  );
}

// Signal light — single square indicator with status color + effects
function SignalLight({ mlStatus }) {
  if (mlStatus === 'loading') {
    // Blinking yellow
    return (
      <div className="relative w-3 h-3 flex items-center justify-center">
        <div
          className="w-3 h-3 bg-[#ca8a04]"
          style={{ animation: 'signalBlink 0.8s step-end infinite' }}
        />
        <style>{`
          @keyframes signalBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.2; }
          }
        `}</style>
      </div>
    );
  }

  if (mlStatus === 'ready') {
    // Solid green with halo
    return (
      <div className="relative w-3 h-3 flex items-center justify-center">
        <div
          className="absolute w-5 h-5 bg-green-600/20"
          style={{ animation: 'signalHalo 2s ease-in-out infinite' }}
        />
        <div className="relative w-3 h-3 bg-green-600" />
        <style>{`
          @keyframes signalHalo {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.4); }
          }
        `}</style>
      </div>
    );
  }

  // idle or failed — red
  return <div className="w-3 h-3 bg-[#ff0000]" />;
}

export default function TopNav({ userProfile, onLogout, mlStatus, mlProgress, onOpenSettings }) {
  const renderMlBadge = () => {
    if (mlStatus === 'loading') {
      return (
        <div className="flex items-center gap-2">
          <SignalLight mlStatus={mlStatus} />
          <div className="flex flex-col gap-[3px]">
            <SegmentedProgress percent={mlProgress.percent} />
            <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-black/40 tabular-nums">
              {mlProgress.percent}%
            </span>
          </div>
        </div>
      );
    }

    if (mlStatus === 'ready') {
      return (
        <div className="flex items-center gap-2">
          <SignalLight mlStatus={mlStatus} />
          <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-black/40">
            AI ON
          </span>
        </div>
      );
    }

    if (mlStatus === 'failed') {
      return (
        <div className="flex items-center gap-2">
          <SignalLight mlStatus={mlStatus} />
          <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-[#ff0000]">
            RULE
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <SignalLight mlStatus="idle" />
        <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-black/40">
          AI OFF
        </span>
      </div>
    );
  };

  return (
    <nav className="w-full flex items-center justify-between px-4 py-3 bg-white border-b-[3px] border-black z-50 font-mono">
      <span className="font-black text-lg text-black uppercase tracking-tighter">
        MAILSWIPE
      </span>

      <div className="flex items-center gap-4">
        {renderMlBadge()}

        {userProfile && (
          <button
            onClick={onOpenSettings}
            className="text-black hover:text-[#ff0000] transition-colors bg-transparent border-none cursor-pointer p-0"
            title="Settings"
          >
            <SettingsIcon size={16} strokeWidth={2.5} />
          </button>
        )}

        {userProfile ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold hidden sm:inline-block text-black uppercase tracking-tight">
              {userProfile.given_name || userProfile.name}
            </span>
            <button
              onClick={onLogout}
              className="text-xs font-bold text-black uppercase tracking-tight underline underline-offset-2 decoration-black hover:text-[#ff0000] hover:decoration-[#ff0000] transition-colors bg-transparent border-none cursor-pointer font-mono"
            >
              LOGOUT
            </button>
          </div>
        ) : (
          <span className="text-xs text-black uppercase font-mono">NOT CONNECTED</span>
        )}
      </div>
    </nav>
  );
}
