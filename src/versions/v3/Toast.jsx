import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActionPastTense } from '../../hooks/useSettings';

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
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-4 py-3 rounded-none shadow-none border-none flex items-center justify-between gap-4 w-11/12 max-w-sm font-mono"
        >
          <span className="font-bold text-xs uppercase tracking-tight">
            EMAIL {getActionPastTense(lastAction.actionConfig)}
          </span>
          <button
            onClick={() => {
              onUndo(lastAction);
              onDismiss();
            }}
            className="font-black text-xs uppercase tracking-tight text-[#ff0000] border-[2px] border-[#ff0000] px-3 py-1 rounded-none bg-transparent hover:bg-[#ff0000] hover:text-white transition-colors cursor-pointer font-mono"
          >
            UNDO
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
