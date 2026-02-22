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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-xl text-white px-5 py-3 rounded-full border border-white/20 flex items-center justify-between gap-4 w-11/12 max-w-sm shadow-lg"
        >
          <span className="font-medium text-sm text-white/90">
            Email {lastAction.action === 'keep' ? 'kept' : lastAction.action === 'trash' ? 'trashed' : lastAction.action === 'archive' ? 'archived' : lastAction.action}
          </span>
          <button
            onClick={() => {
              onUndo(lastAction);
              onDismiss();
            }}
            className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-full text-sm font-semibold transition-all border border-white/20"
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
