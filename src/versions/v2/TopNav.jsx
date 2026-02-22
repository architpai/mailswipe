import React from 'react';
import { LogOut, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function TopNav({ userProfile, onLogout, mlStatus, mlProgress }) {
  const renderMlBadge = () => {
    if (mlStatus === 'loading') {
      return (
        <div className="flex items-center gap-2 text-xs font-medium bg-[#ffb88c]/20 text-[#6b4226] px-3 py-1.5 rounded-full">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ffb88c]" />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold tracking-wide">{mlProgress.stage || 'Loading AI...'}</span>
            {mlProgress.percent > 0 && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-16 h-1.5 bg-[#ffb88c]/25 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ffb88c] rounded-full transition-all duration-300"
                    style={{ width: `${mlProgress.percent}%` }}
                  />
                </div>
                <span className="text-[10px] tabular-nums text-[#6b4226]/60">{mlProgress.percent}%</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (mlStatus === 'ready') {
      return (
        <div className="flex items-center gap-1.5 text-xs font-medium bg-[#a3b18a]/20 text-[#6b4226] px-2.5 py-1 rounded-full tracking-wide">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#a3b18a]" />
          AI Ready
        </div>
      );
    }

    if (mlStatus === 'failed') {
      return (
        <div
          className="flex items-center gap-1.5 text-xs font-medium bg-amber-100/80 text-[#6b4226] px-2.5 py-1 rounded-full tracking-wide"
          title="ML models failed to load, using keyword-based tagging"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          Rule-based
        </div>
      );
    }

    return null;
  };

  return (
    <nav
      className="w-full flex items-center justify-between p-4 bg-white z-50"
      style={{ boxShadow: '0 4px 20px rgba(107,66,38,0.06)' }}
    >
      <div className="flex items-center gap-2">
        {/* Small peach circle accent */}
        <div className="w-3 h-3 rounded-full bg-[#ffb88c]" />
        <span className="font-bold text-lg text-[#6b4226] tracking-wide">
          MailSwipe
        </span>
      </div>

      <div className="flex items-center gap-3">
        {renderMlBadge()}

        {userProfile ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden sm:inline-block text-[#6b4226]/60 tracking-wide">
              {userProfile.given_name || userProfile.name}
            </span>
            <img
              src={userProfile.picture}
              alt="Avatar"
              className="w-8 h-8 rounded-full ring-2 ring-[#ffb88c]/50 ring-offset-1 ring-offset-white"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={onLogout}
              className="p-1.5 text-[#6b4226]/40 hover:text-[#6b4226]/70 hover:bg-[#fdf6ee] transition-all rounded-full"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-sm text-[#6b4226]/40 tracking-wide">Not connected</span>
        )}
      </div>
    </nav>
  );
}
