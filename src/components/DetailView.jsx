import React, { useEffect, useState } from 'react';
import { X, Archive, Trash2, Check, ShieldBan } from 'lucide-react';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFullMessage } from '../gmail/api';

export default function DetailView({ email, onClose, onAction, onUnsubscribe }) {
  const [fullContentHtml, setFullContentHtml] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadImages, setLoadImages] = useState(false);

  useEffect(() => {
    if (!email) return;
    setIsLoading(true);

    fetchFullMessage(email.id)
      .then((fullMsg) => {
        // Extract body gracefully
        const htmlPart = fullMsg.payload.parts?.find(p => p.mimeType === 'text/html');
        const textPart = fullMsg.payload.parts?.find(p => p.mimeType === 'text/plain');
        
        let rawBody = htmlPart?.body?.data || textPart?.body?.data || fullMsg.payload?.body?.data || '';
        if (rawBody) {
          // Decode base64url
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
        className="fixed inset-0 z-50 bg-white shadow-2xl flex flex-col sm:rounded-t-3xl sm:mt-16 sm:h-[calc(100vh-4rem)] sm:max-w-md sm:mx-auto"
      >
        <div className="flex-none p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sm:rounded-t-3xl">
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 truncate pr-4">{email.from?.name || email.from?.email}</span>
            <span className="text-xs text-slate-500">{email.date}</span>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white relative">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">{email.subject}</h1>
          
          {isLoading ? (
            <div className="animate-pulse flex flex-col gap-3">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
            </div>
          ) : (
            <>
              {!loadImages && fullContentHtml.includes('<img') && (
                <div className="w-full bg-slate-100 text-sm text-center py-2 mb-4 rounded-lg text-slate-600 cursor-pointer hover:bg-slate-200" onClick={() => setLoadImages(true)}>
                  Images are hidden. Tap to load.
                </div>
              )}
              <div 
                className="prose prose-sm prose-slate max-w-none break-words email-content"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
              />
            </>
          )}
        </div>

        <div className="flex-none p-4 pb-8 sm:pb-4 border-t border-slate-100 bg-white flex justify-between gap-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <button onClick={() => onAction(email, 'trash')} className="flex-1 py-3 bg-red-100 text-red-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-200 active:scale-95 transition-all">
            <Trash2 className="w-5 h-5" /> Trash
          </button>
          <button onClick={() => onAction(email, 'archive')} className="flex-1 py-3 bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-200 active:scale-95 transition-all">
            <Archive className="w-5 h-5" /> Archive
          </button>
          <button onClick={() => onAction(email, 'keep')} className="flex-1 py-3 bg-green-100 text-green-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-green-200 active:scale-95 transition-all">
            <Check className="w-5 h-5" /> Keep
          </button>
        </div>
        
        {email.unsubscribeLink && (
           <div className="bg-slate-50 border-t border-slate-100 p-3 sm:pb-4 flex justify-center">
             <button onClick={() => onUnsubscribe(email)} className="text-sm font-medium text-slate-600 flex items-center gap-2 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm">
                <ShieldBan className="w-4 h-4" /> Unsubscribe from this sender
             </button>
           </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
