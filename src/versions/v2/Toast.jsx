import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2 } from 'lucide-react';

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
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#6b4226] text-[#fdf6ee] px-5 py-3.5 rounded-2xl flex items-center justify-between gap-4 w-11/12 max-w-sm"
          style={{ boxShadow: '0 8px 30px rgba(107,66,38,0.25), 0 4px 12px rgba(107,66,38,0.15)' }}
        >
          <div className="flex flex-col">
            <span className="font-medium text-sm tracking-wide">
              Email {lastAction.action === 'keep' ? 'kept' : lastAction.action === 'trash' ? 'trashed' : lastAction.action === 'archive' ? 'archived' : lastAction.action}
            </span>
          </div>
          <button
            onClick={() => {
              onUndo(lastAction);
              onDismiss();
            }}
            className="flex items-center gap-1.5 bg-[#fdf6ee]/15 hover:bg-[#fdf6ee]/25 text-[#fdf6ee] px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all tracking-wide"
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
