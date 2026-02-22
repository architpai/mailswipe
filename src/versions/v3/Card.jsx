import React from 'react';

export default function Card({ email, isTop }) {
  if (!email) return null;

  const { from, subject, date, snippet, mlTag, mlSummary, unsubscribeLink } = email;

  return (
    <div
      className={`w-full h-full border-[3px] border-black rounded-none shadow-none p-5 flex flex-col justify-between overflow-hidden bg-white font-mono
        ${isTop ? '' : 'opacity-80'}`}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 overflow-hidden">
            <h3 className="font-bold text-black text-xs uppercase tracking-tight truncate pr-2">
              {from?.name || from?.email}
            </h3>
            <span className="text-[10px] text-black uppercase tracking-wider">{date}</span>
          </div>
          {mlTag && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-black text-white uppercase tracking-tight font-mono rounded-none">
              {mlTag.toUpperCase()}
            </span>
          )}
        </div>

        <h2 className="text-base font-bold text-black mb-2 line-clamp-2 leading-tight font-mono uppercase tracking-tight">
          {subject}
        </h2>

        <p className="text-black text-xs mb-3 line-clamp-4 font-mono leading-relaxed">
          {mlSummary || snippet || 'No snippet available.'}
        </p>
      </div>

      <div className="text-[10px] text-black flex justify-between items-center mt-auto border-t-[2px] border-black pt-2 font-mono uppercase tracking-wider">
        {unsubscribeLink && (
          <span className="text-[#ff0000] font-bold">UNSUB AVAIL</span>
        )}
        <span className="ml-auto">SPACE / HOLD TO VIEW</span>
      </div>
    </div>
  );
}
