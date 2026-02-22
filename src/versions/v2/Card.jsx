import React from 'react';

const TAG_COLORS = {
  PERSONAL: 'bg-[#a3b18a]/20 text-[#6b4226] border-[#a3b18a]/40',
  WORK: 'bg-[#c8b6ff]/20 text-[#6b4226] border-[#c8b6ff]/40',
  NEWSLETTER: 'bg-[#ffb88c]/20 text-[#6b4226] border-[#ffb88c]/40',
  RECEIPT: 'bg-[#f0d9b5]/30 text-[#6b4226] border-[#d4a574]/40',
  ALERT: 'bg-[#ffb88c]/30 text-[#6b4226] border-[#ffb88c]/50',
  SPAM: 'bg-[#e8a0a0]/25 text-[#6b4226] border-[#e8a0a0]/40',
  DEFAULT: 'bg-[#fdf6ee] text-[#6b4226]/70 border-[#6b4226]/10',
};

export default function Card({ email, isTop }) {
  if (!email) return null;

  const { from, subject, date, snippet, mlTag, mlSummary, unsubscribeLink } = email;

  const getTagColor = (tag) => TAG_COLORS[tag?.toUpperCase()] || TAG_COLORS.DEFAULT;

  return (
    <div
      className={`w-full h-full rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative bg-white
        ${isTop
          ? 'shadow-[0_8px_30px_rgba(107,66,38,0.08)]'
          : 'shadow-[0_4px_15px_rgba(107,66,38,0.05)]'
        }`}
    >
      {/* Peach-to-lavender gradient top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
        style={{
          background: 'linear-gradient(90deg, #ffb88c, #c8b6ff)',
        }}
      />

      <div className="relative z-10 mt-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 overflow-hidden">
            <h3 className="font-semibold text-[#6b4226] text-lg truncate pr-2 tracking-wide">
              {from?.name || from?.email}
            </h3>
            <span className="text-xs text-[#6b4226]/50 tracking-wide">{date}</span>
          </div>
          {mlTag && (
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border ${getTagColor(mlTag)} tracking-wide`}
            >
              {mlTag.toUpperCase()}
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-[#6b4226] mb-2 line-clamp-2 leading-relaxed tracking-wide">
          {subject}
        </h2>

        <p className="text-[#6b4226]/60 text-sm mb-4 line-clamp-4 leading-relaxed tracking-wide">
          {mlSummary || snippet || 'No snippet available.'}
        </p>
      </div>

      <div className="relative z-10 text-xs text-[#6b4226]/35 flex justify-between items-center mt-auto border-t border-[#fdf6ee] pt-3 tracking-wide">
        {unsubscribeLink && (
          <span className="bg-[#fdf6ee] text-[#6b4226]/50 px-2.5 py-1 rounded-full flex items-center gap-1">
            Unsubscribe available
          </span>
        )}
        <span className="ml-auto">Tap Space / Long Press to view</span>
      </div>
    </div>
  );
}
