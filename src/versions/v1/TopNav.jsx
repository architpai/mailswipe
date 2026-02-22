import React from 'react';
import { LogOut, Mailbox, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function TopNav({ userProfile, onLogout, mlStatus, mlProgress }) {
  const renderMlBadge = () => {
    if (mlStatus === 'loading') {
      return (
        <div className="flex items-center gap-2 text-xs font-medium bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] px-3 py-1.5 rounded-full shadow-[0_0_12px_rgba(0,212,255,0.2)]">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold">{mlProgress.stage || 'Loading AI...'}</span>
            {mlProgress.percent > 0 && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-16 h-1.5 bg-[#00d4ff]/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00d4ff] rounded-full transition-all duration-300"
                    style={{
                      width: `${mlProgress.percent}%`,
                      boxShadow: '0 0 6px rgba(0,212,255,0.5)',
                    }}
                  />
                </div>
                <span className="text-[10px] tabular-nums">{mlProgress.percent}%</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (mlStatus === 'ready') {
      return (
        <div className="flex items-center gap-1 text-xs font-medium bg-green-500/10 border border-green-500/30 text-green-400 px-2 py-1 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.2)]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          AI Ready
        </div>
      );
    }

    if (mlStatus === 'failed') {
      return (
        <div
          className="flex items-center gap-1 text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-1 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.2)]"
          title="ML models failed to load, using keyword-based tagging"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Rule-based
        </div>
      );
    }

    return null;
  };

  return (
    <nav className="w-full flex items-center justify-between p-4 bg-[#1a1a2e]/90 backdrop-blur-xl border-b border-white/5 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-2">
        <Mailbox className="w-6 h-6 text-[#00d4ff]" style={{ filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.4))' }} />
        <span
          className="font-bold text-lg text-white tracking-tight"
          style={{ textShadow: '0 0 10px rgba(0,212,255,0.3)' }}
        >
          Mail<span className="text-[#00d4ff]">Swipe</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        {renderMlBadge()}

        {userProfile ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden sm:inline-block text-white/70">
              {userProfile.given_name || userProfile.name}
            </span>
            <img
              src={userProfile.picture}
              alt="Avatar"
              className="w-8 h-8 rounded-full border-2 border-[#a855f7]/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={onLogout}
              className="p-1.5 text-white/40 hover:text-[#ff2d7b] transition-colors rounded-full hover:bg-[#ff2d7b]/10 hover:shadow-[0_0_10px_rgba(255,45,123,0.2)]"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-sm text-white/40">Not connected</span>
        )}
      </div>
    </nav>
  );
}
