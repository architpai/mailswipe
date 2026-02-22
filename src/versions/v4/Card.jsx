import React from 'react';

const TAG_COLORS = {
  PERSONAL: 'bg-green-400/15 text-green-300',
  WORK: 'bg-blue-400/15 text-blue-300',
  NEWSLETTER: 'bg-purple-400/15 text-purple-300',
  RECEIPT: 'bg-amber-400/15 text-amber-300',
  ALERT: 'bg-red-400/15 text-red-300',
  SPAM: 'bg-rose-400/15 text-rose-300',
  DEFAULT: 'bg-white/10 text-white/60',
};

export default function Card({ email, isTop }) {
  if (!email) return null;

  const { from, subject, date, snippet, mlTag, mlSummary, unsubscribeLink } = email;

  const getTagColor = (tag) => TAG_COLORS[tag?.toUpperCase()] || TAG_COLORS.DEFAULT;

  return (
    <div
      className={`w-full h-full rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative
        bg-white/10 backdrop-blur-xl border
        ${isTop
          ? 'border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
          : 'border-white/10 shadow-lg'
        }`}
    >
      {/* Iridescent shimmer overlay on top card */}
      {isTop && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #7c3aed 30%, #ec4899 60%, #4f46e5 100%)',
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
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border border-white/10 ${getTagColor(mlTag)}`}
            >
              {mlTag.toUpperCase()}
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 leading-tight">
          {subject}
        </h2>

        <p className="text-white/60 text-sm mb-4 line-clamp-4">
          {mlSummary || snippet || 'No snippet available.'}
        </p>
      </div>

      <div className="relative z-10 text-xs text-white/30 flex justify-between items-center mt-auto border-t border-white/10 pt-3">
        {unsubscribeLink && (
          <span className="bg-white/5 text-white/40 px-2 py-1 rounded-full flex items-center gap-1 border border-white/10">
            Unsubscribe available
          </span>
        )}
        <span className="ml-auto">Tap Space / Long Press to view</span>
      </div>
    </div>
  );
}
