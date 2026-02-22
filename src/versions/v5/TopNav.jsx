import React from 'react';
import { LogOut } from 'lucide-react';

export default function TopNav({ userProfile, onLogout, mlStatus, mlProgress }) {
  const renderMlBadge = () => {
    if (mlStatus === 'loading') {
      return (
        <span className="text-xs italic text-[#1a1a1a]/50">
          {mlProgress.stage || 'Loading...'}
          {mlProgress.percent > 0 && (
            <span className="ml-1 tabular-nums">{mlProgress.percent}%</span>
          )}
        </span>
      );
    }

    if (mlStatus === 'ready') {
      return (
        <span className="text-xs text-green-700 font-semibold">
          AI Ready
        </span>
      );
    }

    if (mlStatus === 'failed') {
      return (
        <span className="text-xs text-[#c41e3a] font-semibold">
          Rule-based
        </span>
      );
    }

    return null;
  };

  return (
    <nav
      className="w-full flex flex-col z-50"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      {/* Thin red accent rule at very top */}
      <div className="h-[2px] bg-[#c41e3a]" />

      <div className="flex items-center justify-between px-4 py-3 bg-[#faf8f2] border-b border-[#1a1a1a]/15">
        {/* Masthead */}
        <span className="font-bold text-xl italic text-[#1a1a1a]">
          MailSwipe
        </span>

        <div className="flex items-center gap-3">
          {/* ML status */}
          {renderMlBadge()}

          {/* Thin vertical rule separator */}
          {mlStatus && (
            <div className="w-px h-5 bg-[#1a1a1a]/15" />
          )}

          {userProfile ? (
            <div className="flex items-center gap-3">
              <span className="text-sm hidden sm:inline-block text-[#1a1a1a]/70">
                {userProfile.given_name || userProfile.name}
              </span>

              {/* Thin vertical rule separator */}
              <div className="w-px h-5 bg-[#1a1a1a]/15" />

              <button
                onClick={onLogout}
                className="p-1.5 text-[#1a1a1a]/40 hover:text-[#c41e3a] transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-sm text-[#1a1a1a]/40 italic">Not connected</span>
          )}
        </div>
      </div>
    </nav>
  );
}
