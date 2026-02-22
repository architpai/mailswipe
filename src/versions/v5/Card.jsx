import React from 'react';

const TAG_COLORS = {
  PERSONAL: 'border-[#c41e3a] text-[#c41e3a]',
  WORK: 'border-[#c41e3a] text-[#c41e3a]',
  NEWSLETTER: 'border-[#c41e3a] text-[#c41e3a]',
  RECEIPT: 'border-[#b8860b] text-[#b8860b]',
  ALERT: 'border-[#c41e3a] text-[#c41e3a]',
  SPAM: 'border-[#c41e3a] text-[#c41e3a]',
  DEFAULT: 'border-[#1a1a1a]/30 text-[#1a1a1a]/60',
};

export default function Card({ email, isTop }) {
  if (!email) return null;

  const { from, subject, date, snippet, mlTag, mlSummary, unsubscribeLink } = email;

  const getTagColor = (tag) => TAG_COLORS[tag?.toUpperCase()] || TAG_COLORS.DEFAULT;

  return (
    <div
      className={`w-full h-full rounded-none p-6 flex flex-col justify-between overflow-hidden relative
        bg-[#faf8f2] border border-[#1a1a1a]/20
        ${isTop ? 'shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : 'shadow-sm'}`}
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      {/* Decorative red rule at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#c41e3a]" />

      <div className="relative z-10 pt-2">
        {/* Dateline and tag row */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 overflow-hidden">
            <h3 className="uppercase tracking-[0.15em] text-xs font-semibold text-[#1a1a1a] truncate pr-2">
              {from?.name || from?.email}
            </h3>
            <span className="text-xs text-[#1a1a1a]/40 italic">{date}</span>
          </div>
          {mlTag && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-none border ${getTagColor(mlTag)}`}
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {mlTag.toUpperCase()}
            </span>
          )}
        </div>

        {/* Thin rule separator */}
        <div className="border-t border-[#1a1a1a]/10 mb-3" />

        {/* Headline */}
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2 line-clamp-2 leading-tight">
          {subject}
        </h2>

        {/* Body snippet */}
        <p className="text-[#1a1a1a]/60 text-sm mb-4 line-clamp-4 leading-relaxed">
          {mlSummary || snippet || 'No snippet available.'}
        </p>
      </div>

      <div className="relative z-10 text-xs text-[#1a1a1a]/30 flex justify-between items-center mt-auto border-t border-[#1a1a1a]/10 pt-3">
        {unsubscribeLink && (
          <span className="text-[#1a1a1a]/40 italic">
            Unsubscribe available
          </span>
        )}
        <span className="ml-auto italic">Tap Space / Long Press to view</span>
      </div>
    </div>
  );
}
