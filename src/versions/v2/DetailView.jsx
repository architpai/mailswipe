import React, { useEffect, useState } from 'react';
import { X, Archive, Trash2, Check, ShieldBan } from 'lucide-react';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFullMessage } from '../../gmail/api';

export default function DetailView({ email, onClose, onAction, onUnsubscribe }) {
  const [fullContentHtml, setFullContentHtml] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadImages, setLoadImages] = useState(false);

  useEffect(() => {
    if (!email) return;
    setIsLoading(true);

    fetchFullMessage(email.id)
      .then((fullMsg) => {
        const htmlPart = fullMsg.payload.parts?.find((p) => p.mimeType === 'text/html');
        const textPart = fullMsg.payload.parts?.find((p) => p.mimeType === 'text/plain');

        let rawBody = htmlPart?.body?.data || textPart?.body?.data || fullMsg.payload?.body?.data || '';
        if (rawBody) {
          rawBody = decodeURIComponent(escape(atob(rawBody.replace(/-/g, '+').replace(/_/g, '/'))));
        }

        setFullContentHtml(rawBody || email.snippet);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [email, onClose]);

  if (!email) return null;

  const sanitizedHtml = DOMPurify.sanitize(fullContentHtml, {
    FORBID_TAGS: loadImages ? ['script', 'style'] : ['img', 'script', 'style'],
    FORBID_ATTR: ['onerror', 'onload'],
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 180 }}
        className="fixed inset-0 z-50 flex flex-col rounded-t-[2.5rem] sm:mt-16 sm:h-[calc(100vh-4rem)] sm:max-w-md sm:mx-auto overflow-hidden bg-white"
        style={{
          boxShadow: '0 -10px 60px rgba(107,66,38,0.12), 0 -2px 20px rgba(107,66,38,0.06)',
        }}
      >
        {/* Header — warm cream section */}
        <div className="flex-none p-5 flex items-center justify-between bg-[#fdf6ee] rounded-t-[2.5rem]">
          <div className="flex flex-col">
            <span className="font-semibold text-[#6b4226] truncate pr-4 tracking-wide">
              {email.from?.name || email.from?.email}
            </span>
            <span className="text-xs text-[#6b4226]/45 tracking-wide">{email.date}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white text-[#6b4226]/50 rounded-full hover:bg-white/80 hover:text-[#6b4226] transition-all"
            style={{ boxShadow: '0 2px 8px rgba(107,66,38,0.08)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Peach-to-lavender gradient accent divider */}
        <div
          className="h-px w-full flex-none"
          style={{
            background: 'linear-gradient(90deg, #ffb88c, #c8b6ff)',
          }}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 relative bg-white">
          <h1 className="text-2xl font-bold text-[#6b4226] mb-6 leading-relaxed tracking-wide">
            {email.subject}
          </h1>

          {isLoading ? (
            <div className="animate-pulse flex flex-col gap-3">
              <div className="h-4 bg-[#fdf6ee] rounded-full w-3/4"></div>
              <div className="h-4 bg-[#fdf6ee] rounded-full w-full"></div>
              <div className="h-4 bg-[#fdf6ee] rounded-full w-5/6"></div>
              <div className="h-4 bg-[#fdf6ee] rounded-full w-full"></div>
            </div>
          ) : (
            <>
              {!loadImages && fullContentHtml.includes('<img') && (
                <div
                  className="w-full bg-[#fdf6ee] text-sm text-center py-2.5 mb-4 rounded-2xl text-[#6b4226]/50 cursor-pointer hover:bg-[#fdf6ee]/80 transition-all tracking-wide"
                  onClick={() => setLoadImages(true)}
                >
                  Images are hidden. Tap to load.
                </div>
              )}
              <div
                className="prose prose-sm max-w-none break-words email-content"
                style={{ color: '#6b4226' }}
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            </>
          )}
        </div>

        {/* Action buttons — pill-shaped */}
        <div
          className="flex-none p-4 pb-8 sm:pb-4 bg-white flex justify-between gap-3"
          style={{ borderTop: '1px solid rgba(253,246,238,1)' }}
        >
          <button
            onClick={() => onAction(email, 'trash')}
            className="flex-1 py-3 bg-[#e8836a]/10 text-[#e8836a] font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#e8836a]/20 active:scale-95 transition-all tracking-wide"
          >
            <Trash2 className="w-5 h-5" /> Trash
          </button>
          <button
            onClick={() => onAction(email, 'archive')}
            className="flex-1 py-3 bg-[#c8b6ff]/15 text-[#9b8ec4] font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#c8b6ff]/25 active:scale-95 transition-all tracking-wide"
          >
            <Archive className="w-5 h-5" /> Archive
          </button>
          <button
            onClick={() => onAction(email, 'keep')}
            className="flex-1 py-3 bg-[#a3b18a]/15 text-[#a3b18a] font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#a3b18a]/25 active:scale-95 transition-all tracking-wide"
          >
            <Check className="w-5 h-5" /> Keep
          </button>
        </div>

        {/* Unsubscribe bar */}
        {email.unsubscribeLink && (
          <div className="bg-[#fdf6ee] p-3 sm:pb-4 flex justify-center">
            <button
              onClick={() => onUnsubscribe(email)}
              className="text-sm font-medium text-[#6b4226]/50 flex items-center gap-2 hover:text-[#6b4226]/70 bg-white px-4 py-2.5 rounded-2xl transition-all tracking-wide"
              style={{ boxShadow: '0 2px 8px rgba(107,66,38,0.06)' }}
            >
              <ShieldBan className="w-4 h-4" /> Unsubscribe from this sender
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
