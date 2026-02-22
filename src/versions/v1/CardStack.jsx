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
      style={{ x, y, rotate, zIndex: 10 }}
      drag
      dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onPointerDown={startLongPress}
      onPointerUp={cancelLongPress}
      onPointerMove={cancelLongPress}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
    >
      <Card email={email} isTop={true} />

      {/* KEEP — Neon green glow overlay */}
      <motion.div
        className="absolute inset-0 rounded-2xl flex items-center justify-center pointer-events-none"
        style={{
          opacity: keepOpacity,
          background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.3) 0%, rgba(34,197,94,0.1) 50%, transparent 80%)',
          boxShadow: '0 0 40px rgba(34,197,94,0.3), inset 0 0 40px rgba(34,197,94,0.1)',
        }}
      >
        <span
          className="text-green-400 font-bold text-4xl tracking-widest border-2 border-green-400 px-6 py-2 rounded-xl transform rotate-12"
          style={{ textShadow: '0 0 20px rgba(34,197,94,0.8), 0 0 40px rgba(34,197,94,0.4)' }}
        >
          KEEP
        </span>
      </motion.div>

      {/* TRASH — Neon red glow overlay */}
      <motion.div
        className="absolute inset-0 rounded-2xl flex items-center justify-center pointer-events-none"
        style={{
          opacity: trashOpacity,
          background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.3) 0%, rgba(239,68,68,0.1) 50%, transparent 80%)',
          boxShadow: '0 0 40px rgba(239,68,68,0.3), inset 0 0 40px rgba(239,68,68,0.1)',
        }}
      >
        <span
          className="text-red-400 font-bold text-4xl tracking-widest border-2 border-red-400 px-6 py-2 rounded-xl transform -rotate-12"
          style={{ textShadow: '0 0 20px rgba(239,68,68,0.8), 0 0 40px rgba(239,68,68,0.4)' }}
        >
          TRASH
        </span>
      </motion.div>

      {/* ARCHIVE — Neon blue glow overlay */}
      <motion.div
        className="absolute inset-0 rounded-2xl flex items-start justify-center pt-10 pointer-events-none"
        style={{
          opacity: archiveOpacity,
          background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.3) 0%, rgba(0,212,255,0.1) 50%, transparent 80%)',
          boxShadow: '0 0 40px rgba(0,212,255,0.3), inset 0 0 40px rgba(0,212,255,0.1)',
        }}
      >
        <span
          className="text-[#00d4ff] font-bold text-4xl tracking-widest border-2 border-[#00d4ff] px-6 py-2 rounded-xl"
          style={{ textShadow: '0 0 20px rgba(0,212,255,0.8), 0 0 40px rgba(0,212,255,0.4)' }}
        >
          ARCHIVE
        </span>
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
      <div className="flex-1 flex flex-col items-center justify-center text-white/40">
        <div
          className="text-5xl mb-4"
          style={{ textShadow: '0 0 20px rgba(0,212,255,0.5)' }}
        >
          &#x2728;
        </div>
        <h2
          className="text-2xl font-bold text-white mb-1"
          style={{ textShadow: '0 0 15px rgba(0,212,255,0.3)' }}
        >
          All clear!
        </h2>
        <p className="text-white/50">No more emails to triage right now.</p>
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
