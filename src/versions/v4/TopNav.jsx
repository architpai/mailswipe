import React from 'react';
import { LogOut, Mailbox, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function TopNav({ userProfile, onLogout, mlStatus, mlProgress }) {
  const renderMlBadge = () => {
    if (mlStatus === 'loading') {
      return (
        <div className="flex items-center gap-2 text-xs font-medium bg-white/10 backdrop-blur-xl border border-white/20 text-white px-3 py-1.5 rounded-full">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-white/80" />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-white/90">{mlProgress.stage || 'Loading AI...'}</span>
            {mlProgress.percent > 0 && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/60 rounded-full transition-all duration-300"
                    style={{ width: `${mlProgress.percent}%` }}
                  />
                </div>
                <span className="text-[10px] tabular-nums text-white/60">{mlProgress.percent}%</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (mlStatus === 'ready') {
      return (
        <div className="flex items-center gap-1 text-xs font-medium bg-green-500/15 backdrop-blur-xl border border-green-400/30 text-green-300 px-2 py-1 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" />
          AI Ready
        </div>
      );
    }

    if (mlStatus === 'failed') {
      return (
        <div
          className="flex items-center gap-1 text-xs font-medium bg-amber-500/15 backdrop-blur-xl border border-amber-400/30 text-amber-300 px-2 py-1 rounded-full"
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
    <nav className="w-full flex items-center justify-between p-4 bg-white/10 backdrop-blur-xl border-b border-white/10 z-50">
      <div className="flex items-center gap-2">
        <Mailbox className="w-6 h-6 text-white/80" />
        <span className="font-light text-lg text-white tracking-tight">
          MailSwipe
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
              className="w-8 h-8 rounded-full border-2 border-white/30"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={onLogout}
              className="p-1.5 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10"
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
