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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a2e]/95 backdrop-blur-xl text-white px-4 py-3 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-[#00d4ff]/20 flex items-center justify-between gap-4 w-11/12 max-w-sm"
          style={{ boxShadow: '0 0 20px rgba(0,212,255,0.1), 0 8px 32px rgba(0,0,0,0.4)' }}
        >
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-white/90">
              Email {lastAction.action === 'keep' ? 'kept' : lastAction.action === 'trash' ? 'trashed' : lastAction.action === 'archive' ? 'archived' : lastAction.action}
            </span>
          </div>
          <button
            onClick={() => {
              onUndo(lastAction);
              onDismiss();
            }}
            className="flex items-center gap-1 bg-[#00d4ff]/15 hover:bg-[#00d4ff]/25 text-[#00d4ff] px-3 py-1.5 rounded-lg text-sm font-bold transition-all border border-[#00d4ff]/20 hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]"
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
