import React from 'react';
import { LogOut, Mailbox, Loader2 } from 'lucide-react';

export default function TopNav({ userProfile, onLogout, isMlLoading }) {
  return (
    <nav className="w-full flex items-center justify-between p-4 bg-white shadow-sm z-50">
      <div className="flex items-center gap-2">
        <Mailbox className="w-6 h-6 text-blue-600" />
        <span className="font-bold text-lg text-slate-800 tracking-tight">MailSwipe</span>
      </div>
      
      <div className="flex items-center gap-4">
        {isMlLoading && (
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-full">
            <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
            AI loading...
          </div>
        )}
        
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
