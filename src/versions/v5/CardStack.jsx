import React, { useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import Card from './Card';

const SWIPE_THRESHOLD_X = 120;
const SWIPE_THRESHOLD_Y = 150;

const SwipeableCard = React.forwardRef(function SwipeableCard({ email, onSwipe, onOpenDetail }, ref) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-15, 15]);

  const keepOpacity = useTransform(x, [0, SWIPE_THRESHOLD_X], [0, 1]);
  const trashOpacity = useTransform(x, [0, -SWIPE_THRESHOLD_X], [0, 1]);
  const archiveOpacity = useTransform(y, [0, -SWIPE_THRESHOLD_Y], [0, 1]);

  const longPressRef = useRef(null);
  const swiped = useRef(false);

  const triggerSwipe = useCallback((direction) => {
    if (swiped.current) return;
    swiped.current = true;

    const action = direction === 'right' ? 'keep' : direction === 'left' ? 'trash' : 'archive';
    onSwipe(email, action);
  }, [email, onSwipe]);

  const handleDragEnd = useCallback((event, info) => {
    const { offset } = info;

    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      if (offset.x > SWIPE_THRESHOLD_X) {
        triggerSwipe('right');
      } else if (offset.x < -SWIPE_THRESHOLD_X) {
        triggerSwipe('left');
      }
    } else {
      if (offset.y < -SWIPE_THRESHOLD_Y) {
        triggerSwipe('up');
      }
    }
  }, [triggerSwipe]);

  const startLongPress = useCallback(() => {
    longPressRef.current = setTimeout(() => {
      onOpenDetail(email);
    }, 500);
  }, [email, onOpenDetail]);

  const cancelLongPress = useCallback(() => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  }, []);

  return (
    <motion.div
      className="absolute w-full h-[450px]"
      style={{ x, y, rotate, zIndex: 10, fontFamily: 'Georgia, "Times New Roman", serif' }}
      drag
      dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onPointerDown={startLongPress}
      onPointerUp={cancelLongPress}
      onPointerMove={cancelLongPress}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
    >
      <Card email={email} isTop={true} />

      {/* KEEP — Elegant green banner */}
      <motion.div
        className="absolute inset-0 rounded-none flex items-center justify-center pointer-events-none bg-green-800/20"
        style={{ opacity: keepOpacity }}
      >
        <span
          className="text-green-800 font-bold text-4xl tracking-[0.15em] border-2 border-green-800 bg-green-50/90 px-8 py-3 transform rotate-12"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          Keep
        </span>
      </motion.div>

      {/* TRASH — Red rubber stamp effect */}
      <motion.div
        className="absolute inset-0 rounded-none flex items-center justify-center pointer-events-none bg-[#c41e3a]/10"
        style={{ opacity: trashOpacity }}
      >
        <span
          className="text-[#c41e3a] font-bold text-5xl tracking-[0.2em] uppercase border-4 border-[#c41e3a] px-8 py-3 transform -rotate-12"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            textShadow: '1px 1px 0 rgba(196,30,58,0.3)',
          }}
        >
          Trash
        </span>
      </motion.div>

      {/* ARCHIVE — Blue editorial text with decorative rules */}
      <motion.div
        className="absolute inset-0 rounded-none flex items-start justify-center pt-12 pointer-events-none bg-blue-900/10"
        style={{ opacity: archiveOpacity }}
      >
        <div className="flex flex-col items-center">
          <div className="w-32 border-t border-blue-800 mb-2" />
          <span
            className="text-blue-800 font-bold text-4xl tracking-[0.15em]"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Archive
          </span>
          <div className="w-32 border-t border-blue-800 mt-2" />
        </div>
      </motion.div>
    </motion.div>
  );
});

export default function CardStack({ emails, onSwipe, onOpenDetail }) {
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!emails || emails.length === 0) return;
      const email = emails[0];

      switch (e.key) {
        case 'ArrowRight':
          onSwipe(email, 'keep');
          break;
        case 'ArrowLeft':
          onSwipe(email, 'trash');
          break;
        case 'ArrowUp':
          onSwipe(email, 'archive');
          break;
        case ' ':
          e.preventDefault();
          onOpenDetail(email);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [emails, onSwipe, onOpenDetail]);

  if (!emails || emails.length === 0) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center text-[#1a1a1a]/40"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        <div className="w-16 border-t border-[#1a1a1a]/20 mb-4" />
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1 italic">
          All clear.
        </h2>
        <p className="text-[#1a1a1a]/50 italic text-sm">No more editions to review.</p>
        <div className="w-16 border-t border-[#1a1a1a]/20 mt-4" />
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm h-[500px] flex items-center justify-center perspective-1000">
      {/* Background cards (non-interactive) */}
      {emails.slice(1, 3).reverse().map((email) => {
        const indexFromTop = emails.findIndex((e) => e.id === email.id);
        return (
          <motion.div
            key={email.id}
            className="absolute w-full h-[450px]"
            style={{
              scale: 1 - indexFromTop * 0.05,
              y: indexFromTop * 15,
              zIndex: 10 - indexFromTop,
              opacity: 1 - indexFromTop * 0.2,
            }}
          >
            <Card email={email} isTop={false} />
          </motion.div>
        );
      })}

      {/* Top card (swipeable) */}
      <AnimatePresence mode="popLayout">
        <SwipeableCard
          key={emails[0].id}
          email={emails[0]}
          onSwipe={onSwipe}
          onOpenDetail={onOpenDetail}
        />
      </AnimatePresence>
    </div>
  );
}
