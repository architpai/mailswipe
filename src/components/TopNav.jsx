import React from 'react';
import { LogOut, Mailbox, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function TopNav({ userProfile, onLogout, mlStatus, mlProgress }) {
  const renderMlBadge = () => {
    if (mlStatus === 'loading') {
      return (
        <div className="flex items-center gap-2 text-xs font-medium bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold">{mlProgress.stage || 'Loading AI...'}</span>
            {mlProgress.percent > 0 && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-16 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${mlProgress.percent}%` }}
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
        <div className="flex items-center gap-1 text-xs font-medium bg-green-50 border border-green-200 text-green-700 px-2 py-1 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" />
          AI Ready
        </div>
      );
    }

    if (mlStatus === 'failed') {
      return (
        <div className="flex items-center gap-1 text-xs font-medium bg-amber-50 border border-amber-200 text-amber-700 px-2 py-1 rounded-full" title="ML models failed to load, using keyword-based tagging">
          <AlertTriangle className="w-3.5 h-3.5" />
          Rule-based
        </div>
      );
    }

    return null;
  };

  return (
    <nav className="w-full flex items-center justify-between p-4 bg-white shadow-sm z-50">
      <div className="flex items-center gap-2">
        <Mailbox className="w-6 h-6 text-blue-600" />
        <span className="font-bold text-lg text-slate-800 tracking-tight">MailSwipe</span>
      </div>
      
      <div className="flex items-center gap-3">
        {renderMlBadge()}
        
        {userProfile ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden sm:inline-block text-slate-700">
              {userProfile.given_name || userProfile.name}
            </span>
            <img 
              src={userProfile.picture} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full border border-slate-200" 
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-slate-100"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-sm text-slate-400">Not connected</span>
        )}
      </div>
    </nav>
  );
}
