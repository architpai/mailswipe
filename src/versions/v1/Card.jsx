import React from 'react';

const TAG_COLORS = {
  PERSONAL: 'bg-green-500/15 text-green-400 border-green-500/30 shadow-[0_0_8px_rgba(34,197,94,0.2)]',
  WORK: 'bg-blue-500/15 text-[#00d4ff] border-[#00d4ff]/30 shadow-[0_0_8px_rgba(0,212,255,0.2)]',
  NEWSLETTER: 'bg-purple-500/15 text-[#a855f7] border-[#a855f7]/30 shadow-[0_0_8px_rgba(168,85,247,0.2)]',
  RECEIPT: 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(251,191,36,0.2)]',
  ALERT: 'bg-red-500/15 text-red-400 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.2)]',
  SPAM: 'bg-rose-500/15 text-[#ff2d7b] border-[#ff2d7b]/30 shadow-[0_0_8px_rgba(255,45,123,0.2)]',
  DEFAULT: 'bg-slate-500/15 text-slate-400 border-slate-500/30 shadow-[0_0_8px_rgba(148,163,184,0.1)]',
};

export default function Card({ email, isTop }) {
  if (!email) return null;

  const { from, subject, date, snippet, mlTag, mlSummary, unsubscribeLink } = email;

  const getTagColor = (tag) => TAG_COLORS[tag?.toUpperCase()] || TAG_COLORS.DEFAULT;

  return (
    <div
      className={`w-full h-full rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative
        bg-[#1a1a2e]/80 backdrop-blur-xl border
        ${isTop
          ? 'border-[#00d4ff]/30 shadow-[0_0_30px_rgba(0,212,255,0.15),0_0_60px_rgba(168,85,247,0.08)]'
          : 'border-white/5 shadow-lg'
        }`}
    >
      {/* Subtle gradient shimmer on top card */}
      {isTop && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, transparent 40%, #ff2d7b 70%, transparent 100%)',
            }}
          />
        </div>
      )}

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 overflow-hidden">
            <h3 className="font-semibold text-white text-lg truncate pr-2">
              {from?.name || from?.email}
            </h3>
            <span className="text-xs text-white/40">{date}</span>
          </div>
          {mlTag && (
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getTagColor(mlTag)}`}
            >
              {mlTag.toUpperCase()}
            </span>
          )}
        </div>

        <h2
          className="text-xl font-bold text-white mb-2 line-clamp-2 leading-tight"
          style={{ textShadow: '0 0 20px rgba(255,255,255,0.05)' }}
        >
          {subject}
        </h2>

        <p className="text-white/60 text-sm mb-4 line-clamp-4 relative">
          {mlSummary || snippet || 'No snippet available.'}
        </p>
      </div>

      <div className="relative z-10 text-xs text-white/30 flex justify-between items-center mt-auto border-t border-white/10 pt-3">
        {unsubscribeLink && (
          <span className="bg-white/5 text-white/40 px-2 py-1 rounded flex items-center gap-1 border border-white/5">
            Unsubscribe available
          </span>
        )}
        <span className="ml-auto">Tap Space / Long Press to view</span>
      </div>
    </div>
  );
}
