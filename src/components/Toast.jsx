import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2 } from 'lucide-react';

export default function Toast({ lastAction, onUndo, onDismiss }) {
  useEffect(() => {
    if (lastAction) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000); // 4 seconds
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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-4 w-11/12 max-w-sm"
        >
          <div className="flex flex-col">
            <span className="font-semibold text-sm">
              Email {lastAction.action}
            </span>
          </div>
          <button
            onClick={() => {
              onUndo(lastAction);
              onDismiss();
            }}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
