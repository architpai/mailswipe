import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
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
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-50 flex flex-col sm:mt-16 sm:h-[calc(100vh-4rem)] sm:max-w-md sm:mx-auto overflow-hidden bg-[#faf8f2] border border-[#1a1a1a]/15"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        {/* Decorative red rule at top */}
        <div className="h-[2px] bg-[#c41e3a] flex-none" />

        {/* Header */}
        <div className="flex-none p-4 flex items-center justify-between border-b border-[#1a1a1a]/10">
          <div className="flex flex-col">
            <span className="uppercase tracking-[0.15em] text-xs font-semibold text-[#1a1a1a]/60">
              Correspondence
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6">
          {/* Headline */}
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-3 leading-tight">
            {email.subject}
          </h1>

          {/* Byline */}
          <p className="italic text-[#1a1a1a]/60 text-sm mb-1">
            From {email.from?.name || email.from?.email}
          </p>

          {/* Dateline */}
          <p className="uppercase tracking-[0.15em] text-xs font-semibold text-[#1a1a1a]/40 mb-4">
            {email.date}
          </p>

          {/* Red decorative rule separating header from body */}
          <div className="border-t-2 border-[#c41e3a] mb-6 w-16" />

          {isLoading ? (
            <div className="animate-pulse flex flex-col gap-3">
              <div className="h-4 bg-[#1a1a1a]/5 w-3/4" />
              <div className="h-4 bg-[#1a1a1a]/5 w-full" />
              <div className="h-4 bg-[#1a1a1a]/5 w-5/6" />
              <div className="h-4 bg-[#1a1a1a]/5 w-full" />
            </div>
          ) : (
            <>
              {!loadImages && fullContentHtml.includes('<img') && (
                <div
                  className="w-full bg-[#1a1a1a]/5 text-sm text-center py-2 mb-4 text-[#1a1a1a]/50 cursor-pointer hover:bg-[#1a1a1a]/10 border border-[#1a1a1a]/10 transition-all italic"
                  onClick={() => setLoadImages(true)}
                >
                  Images are hidden. Tap to load.
                </div>
              )}
              <div
                className="prose prose-sm max-w-none break-words email-content leading-relaxed"
                style={{ color: '#1a1a1a', fontFamily: 'Georgia, "Times New Roman", serif' }}
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            </>
          )}
        </div>

        {/* Action buttons — elegant rectangles with thin borders */}
        <div className="flex-none p-4 pb-8 sm:pb-4 border-t border-[#1a1a1a]/10 bg-[#faf8f2] flex justify-between gap-3">
          <button
            onClick={() => onAction(email, 'trash')}
            className="flex-1 py-3 bg-transparent text-[#c41e3a] font-semibold rounded-none flex items-center justify-center gap-2 border border-[#c41e3a] hover:bg-[#c41e3a] hover:text-white active:scale-95 transition-all"
          >
            Trash
          </button>
          <button
            onClick={() => onAction(email, 'archive')}
            className="flex-1 py-3 bg-transparent text-[#1a1a1a] font-semibold rounded-none flex items-center justify-center gap-2 border border-[#1a1a1a]/30 hover:bg-[#1a1a1a] hover:text-[#faf8f2] active:scale-95 transition-all"
          >
            Archive
          </button>
          <button
            onClick={() => onAction(email, 'keep')}
            className="flex-1 py-3 bg-transparent text-green-800 font-semibold rounded-none flex items-center justify-center gap-2 border border-green-800 hover:bg-green-800 hover:text-white active:scale-95 transition-all"
          >
            Keep
          </button>
        </div>

        {/* Unsubscribe — small italic red text link */}
        {email.unsubscribeLink && (
          <div className="bg-[#faf8f2] border-t border-[#1a1a1a]/10 p-3 sm:pb-4 flex justify-center">
            <button
              onClick={() => onUnsubscribe(email)}
              className="text-sm italic text-[#c41e3a]/70 hover:text-[#c41e3a] transition-colors underline underline-offset-2"
            >
              Unsubscribe from this sender
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
