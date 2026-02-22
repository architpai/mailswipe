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
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-50 flex flex-col sm:rounded-t-3xl sm:mt-16 sm:h-[calc(100vh-4rem)] sm:max-w-md sm:mx-auto overflow-hidden bg-white/10 backdrop-blur-2xl border border-white/20"
      >
        {/* Header */}
        <div className="flex-none p-4 flex items-center justify-between bg-white/5 backdrop-blur-xl sm:rounded-t-3xl border-b border-white/10">
          <div className="flex flex-col">
            <span className="font-semibold text-white truncate pr-4">
              {email.from?.name || email.from?.email}
            </span>
            <span className="text-xs text-white/40">{email.date}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 text-white/60 rounded-full hover:bg-white/20 hover:text-white transition-all border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtle gradient divider */}
        <div
          className="h-px w-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
          }}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          <h1 className="text-2xl font-bold text-white mb-6">
            {email.subject}
          </h1>

          {isLoading ? (
            <div className="animate-pulse flex flex-col gap-3">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-4 bg-white/10 rounded w-full"></div>
              <div className="h-4 bg-white/10 rounded w-5/6"></div>
              <div className="h-4 bg-white/10 rounded w-full"></div>
            </div>
          ) : (
            <>
              {!loadImages && fullContentHtml.includes('<img') && (
                <div
                  className="w-full bg-white/5 text-sm text-center py-2 mb-4 rounded-xl text-white/50 cursor-pointer hover:bg-white/10 border border-white/10 transition-all"
                  onClick={() => setLoadImages(true)}
                >
                  Images are hidden. Tap to load.
                </div>
              )}
              <div
                className="prose prose-sm prose-invert max-w-none break-words email-content"
                style={{ color: 'rgba(255,255,255,0.8)' }}
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            </>
          )}
        </div>

        {/* Action buttons — frosted glass with colored tints */}
        <div className="flex-none p-4 pb-8 sm:pb-4 border-t border-white/10 bg-white/5 backdrop-blur-xl flex justify-between gap-3">
          <button
            onClick={() => onAction(email, 'trash')}
            className="flex-1 py-3 bg-red-500/15 text-white font-bold rounded-xl flex items-center justify-center gap-2 border border-red-400/20 hover:bg-red-500/25 active:scale-95 transition-all backdrop-blur-sm"
          >
            <Trash2 className="w-5 h-5" /> Trash
          </button>
          <button
            onClick={() => onAction(email, 'archive')}
            className="flex-1 py-3 bg-blue-500/15 text-white font-bold rounded-xl flex items-center justify-center gap-2 border border-blue-400/20 hover:bg-blue-500/25 active:scale-95 transition-all backdrop-blur-sm"
          >
            <Archive className="w-5 h-5" /> Archive
          </button>
          <button
            onClick={() => onAction(email, 'keep')}
            className="flex-1 py-3 bg-green-500/15 text-white font-bold rounded-xl flex items-center justify-center gap-2 border border-green-400/20 hover:bg-green-500/25 active:scale-95 transition-all backdrop-blur-sm"
          >
            <Check className="w-5 h-5" /> Keep
          </button>
        </div>

        {/* Unsubscribe bar */}
        {email.unsubscribeLink && (
          <div className="bg-white/5 border-t border-white/10 p-3 sm:pb-4 flex justify-center backdrop-blur-xl">
            <button
              onClick={() => onUnsubscribe(email)}
              className="text-sm font-medium text-white/50 flex items-center gap-2 hover:text-white bg-white/5 border border-white/15 px-4 py-2 rounded-xl transition-all hover:bg-white/10"
            >
              <ShieldBan className="w-4 h-4" /> Unsubscribe from this sender
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
