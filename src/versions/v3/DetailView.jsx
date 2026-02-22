import React, { useEffect, useState } from 'react';
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
        className="fixed inset-0 z-50 flex flex-col bg-white sm:mt-16 sm:h-[calc(100vh-4rem)] sm:max-w-md sm:mx-auto overflow-hidden border-t-[3px] border-black font-mono"
      >
        {/* Header */}
        <div className="flex-none p-4 flex items-center justify-between bg-white border-b-[3px] border-black">
          <div className="flex flex-col">
            <span className="font-black text-sm text-black uppercase tracking-tight truncate pr-4">
              {email.from?.name || email.from?.email}
            </span>
            <span className="text-[10px] text-black uppercase tracking-wider">{email.date}</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#ff0000] font-black text-2xl leading-none hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer font-mono"
          >
            X
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
          <h1 className="text-lg font-black text-black mb-4 uppercase tracking-tight leading-tight">
            {email.subject}
          </h1>

          {isLoading ? (
            <div className="flex flex-col gap-2">
              <div className="h-3 bg-black/10 w-3/4"></div>
              <div className="h-3 bg-black/10 w-full"></div>
              <div className="h-3 bg-black/10 w-5/6"></div>
              <div className="h-3 bg-black/10 w-full"></div>
            </div>
          ) : (
            <>
              {!loadImages && fullContentHtml.includes('<img') && (
                <div
                  className="w-full bg-white text-xs text-center py-2 mb-4 border-[2px] border-black text-black cursor-pointer hover:bg-black hover:text-white transition-colors font-mono uppercase tracking-wider font-bold"
                  onClick={() => setLoadImages(true)}
                >
                  IMAGES HIDDEN. TAP TO LOAD.
                </div>
              )}
              <div
                className="prose prose-sm max-w-none break-words email-content font-mono text-black text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex-none p-4 pb-8 sm:pb-4 border-t-[3px] border-black bg-white flex justify-between gap-2">
          <button
            onClick={() => onAction(email, 'trash')}
            className="flex-1 py-3 bg-white text-black font-black border-[3px] border-black rounded-none flex items-center justify-center gap-1 hover:bg-[#ff0000] hover:text-white hover:border-[#ff0000] active:scale-95 transition-all font-mono text-xs uppercase tracking-tight"
          >
            TRASH
          </button>
          <button
            onClick={() => onAction(email, 'archive')}
            className="flex-1 py-3 bg-white text-black font-black border-[3px] border-black rounded-none flex items-center justify-center gap-1 hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-95 transition-all font-mono text-xs uppercase tracking-tight"
          >
            ARCHIVE
          </button>
          <button
            onClick={() => onAction(email, 'keep')}
            className="flex-1 py-3 bg-white text-black font-black border-[3px] border-black rounded-none flex items-center justify-center gap-1 hover:bg-green-600 hover:text-white hover:border-green-600 active:scale-95 transition-all font-mono text-xs uppercase tracking-tight"
          >
            KEEP
          </button>
        </div>

        {/* Unsubscribe */}
        {email.unsubscribeLink && (
          <div className="bg-white border-t-[2px] border-black p-3 sm:pb-4 flex justify-center">
            <button
              onClick={() => onUnsubscribe(email)}
              className="text-xs font-bold text-[#ff0000] underline underline-offset-4 decoration-[#ff0000] uppercase tracking-wider bg-transparent border-none cursor-pointer font-mono hover:opacity-70 transition-opacity"
            >
              UNSUBSCRIBE FROM THIS SENDER
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
