import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ lastAction, onUndo, onDismiss }) {
  useEffect(() => {
    if (lastAction) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [lastAction, onDismiss]);

  return (
    <AnimatePresence>
      {lastAction && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white text-[#1a1a1a] px-5 py-3 rounded-none border border-[#1a1a1a]/20 flex items-center justify-between gap-4 w-11/12 max-w-sm shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          <span className="text-sm">
            Email{' '}
            <span className="font-semibold">
              {lastAction.action === 'keep' ? 'kept' : lastAction.action === 'trash' ? 'trashed' : lastAction.action === 'archive' ? 'archived' : lastAction.action}
            </span>
          </span>
          <button
            onClick={() => {
              onUndo(lastAction);
              onDismiss();
            }}
            className="text-sm font-semibold text-[#c41e3a] hover:text-[#c41e3a]/80 transition-colors underline underline-offset-2"
          >
            Undo
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
