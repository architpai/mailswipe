import React from 'react';

export default function TopNav({ userProfile, onLogout, mlStatus, mlProgress }) {
  const renderMlBadge = () => {
    if (mlStatus === 'loading') {
      return (
        <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-tight text-black">
          <span className="inline-block w-2 h-2 bg-[#ff0000] rounded-none animate-pulse"></span>
          <div className="flex flex-col leading-tight">
            <span>LOADING...</span>
            {mlProgress.percent > 0 && (
              <span className="text-[10px] tabular-nums">{mlProgress.percent}%</span>
            )}
          </div>
        </div>
      );
    }

    if (mlStatus === 'ready') {
      return (
        <span className="text-xs font-bold font-mono uppercase tracking-tight text-green-700">
          AI:READY
        </span>
      );
    }

    if (mlStatus === 'failed') {
      return (
        <span className="text-xs font-bold font-mono uppercase tracking-tight text-[#ff0000]">
          RULE-BASED
        </span>
      );
    }

    return null;
  };

  return (
    <nav className="w-full flex items-center justify-between px-4 py-3 bg-white border-b-[3px] border-black z-50 font-mono">
      <span className="font-black text-lg text-black uppercase tracking-tighter">
        MAILSWIPE
      </span>

      <div className="flex items-center gap-4">
        {renderMlBadge()}

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
