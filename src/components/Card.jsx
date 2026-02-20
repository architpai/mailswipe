import React from 'react';

const TAG_COLORS = {
  PERSONAL: 'bg-green-100 text-green-700 border-green-200',
  WORK: 'bg-blue-100 text-blue-700 border-blue-200',
  NEWSLETTER: 'bg-purple-100 text-purple-700 border-purple-200',
  RECEIPT: 'bg-amber-100 text-amber-700 border-amber-200',
  ALERT: 'bg-red-100 text-red-700 border-red-200',
  SPAM: 'bg-rose-100 text-rose-700 border-rose-200',
  DEFAULT: 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function Card({ email, isTop, index }) {
  if (!email) return null;

  const { id, from, subject, date, snippet, mlTag, mlSummary, unsubscribeLink } = email;

  const getTagColor = (tag) => TAG_COLORS[tag?.toUpperCase()] || TAG_COLORS.DEFAULT;

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-slate-100 p-6 flex flex-col justify-between overflow-hidden relative">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 overflow-hidden">
            <h3 className="font-semibold text-slate-800 text-lg truncate pr-2">{from?.name || from?.email}</h3>
            <span className="text-xs text-slate-400">{date}</span>
          </div>
          {mlTag && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getTagColor(mlTag)}`}>
              {mlTag.toUpperCase()}
            </span>
          )}
        </div>
        
        <h2 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 leading-tight">
          {subject}
        </h2>
        
        <p className="text-slate-600 text-sm mb-4 line-clamp-4 relative">
          {mlSummary || snippet || "No snippet available."}
        </p>
      </div>

      <div className="text-xs text-slate-400 flex justify-between items-center mt-auto border-t border-slate-50 pt-3">
        {unsubscribeLink && (
          <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded flex items-center gap-1">
            Unsubscribe available
          </span>
        )}
        <span className="ml-auto">Tap Space / Long Press to view</span>
      </div>
    </div>
  );
}
