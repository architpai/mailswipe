import React, { useEffect, useRef, useCallback, forwardRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, animate } from 'framer-motion';
import Card from './Card';

const SWIPE_MIN_DISTANCE = 120;
// Angle zones (0° = right, 90° = up, 180° = left)
const KEEP_MAX_ANGLE = 70;
const ARCHIVE_MAX_ANGLE = 130;

// Compute swipe angle: 0° pure right, 90° pure up, 180° pure left, >180° downward
function swipeAngle(px, py) {
  const raw = Math.atan2(-py, px) * (180 / Math.PI);
  return raw < 0 ? raw + 360 : raw;
}

// Dynamic exit based on direction — passed via framer-motion `custom` prop
const cardExitVariant = (direction) => ({
  x: direction === 'right' ? 600 : direction === 'left' ? -600 : 0,
  y: direction === 'up' ? -500 : 0,
  rotate: direction === 'right' ? 18 : direction === 'left' ? -18 : 0,
  opacity: 0,
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
});

const SwipeableCard = forwardRef(function SwipeableCard({ email, onSwipe, onOpenDetail, onSetDirection, onUnsubscribe }, ref) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-15, 15]);

  // Angle-aware opacity: only show the overlay for the active zone
  const keepOpacity = useTransform([x, y], ([lx, ly]) => {
    const angle = swipeAngle(lx, ly);
    const dist = Math.sqrt(lx * lx + ly * ly);
    if (angle > KEEP_MAX_ANGLE && angle < 290) return 0;
    return Math.min(1, dist / SWIPE_MIN_DISTANCE);
  });

  const archiveOpacity = useTransform([x, y], ([lx, ly]) => {
    const angle = swipeAngle(lx, ly);
    const dist = Math.sqrt(lx * lx + ly * ly);
    if (angle <= KEEP_MAX_ANGLE || angle > ARCHIVE_MAX_ANGLE) return 0;
    return Math.min(1, dist / SWIPE_MIN_DISTANCE);
  });

  const trashOpacity = useTransform([x, y], ([lx, ly]) => {
    const angle = swipeAngle(lx, ly);
    const dist = Math.sqrt(lx * lx + ly * ly);
    if (angle <= ARCHIVE_MAX_ANGLE || angle > 229) return 0;
    return Math.min(1, dist / SWIPE_MIN_DISTANCE);
  });

  const longPressRef = useRef(null);
  const swiped = useRef(false);

  const triggerSwipe = useCallback((direction) => {
    if (swiped.current) return;
    swiped.current = true;

    const action = direction === 'right' ? 'keep' : direction === 'left' ? 'trash' : 'archive';
    onSetDirection(direction);
    onSwipe(email, action);
  }, [email, onSwipe, onSetDirection]);

  // Keyboard shortcuts — animate overlay, then trigger swipe
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (swiped.current) return;

      let direction = null;
      switch (e.key) {
        case 'ArrowRight': direction = 'right'; break;
        case 'ArrowLeft': direction = 'left'; break;
        case 'ArrowUp': e.preventDefault(); direction = 'up'; break;
        case ' ':
          e.preventDefault();
          onOpenDetail(email);
          return;
        default: return;
      }

      // Animate motion values to flash the overlay
      const targetX = direction === 'right' ? SWIPE_MIN_DISTANCE + 30 : direction === 'left' ? -(SWIPE_MIN_DISTANCE + 30) : 0;
      const targetY = direction === 'up' ? -(SWIPE_MIN_DISTANCE + 30) : 0;

      animate(x, targetX, { duration: 0.1, ease: 'easeOut' });
      animate(y, targetY, { duration: 0.1, ease: 'easeOut' });

      setTimeout(() => triggerSwipe(direction), 130);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerSwipe, x, y, email, onOpenDetail]);

  const handleDragEnd = useCallback((event, info) => {
    const { offset } = info;
    const dist = Math.sqrt(offset.x ** 2 + offset.y ** 2);
    if (dist < SWIPE_MIN_DISTANCE) return;

    const angle = swipeAngle(offset.x, offset.y);
    if (angle > 229 && angle < 290) return; // straight-down dead zone

    if (angle <= KEEP_MAX_ANGLE || angle >= 290) {
      triggerSwipe('right');
    } else if (angle <= ARCHIVE_MAX_ANGLE) {
      triggerSwipe('up');
    } else if (angle <= 229) {
      triggerSwipe('left');
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
      ref={ref}
      className="absolute w-full h-[450px]"
      style={{ x, y, rotate, zIndex: 10 }}
      drag
      dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onPointerDown={startLongPress}
      onPointerUp={cancelLongPress}
      onPointerMove={cancelLongPress}
      exit={cardExitVariant}
    >
      <Card email={email} isTop={true} onUnsubscribe={onUnsubscribe} />

      {/* KEEP — green */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: keepOpacity, backgroundColor: 'rgba(22,163,74,0.85)' }}
      >
        <span
          className="font-mono font-black text-5xl tracking-tighter uppercase"
          style={{ color: '#faf9f6', transform: 'rotate(-12deg)' }}
        >
          KEEP
        </span>
      </motion.div>

      {/* TRASH — red */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: trashOpacity, backgroundColor: 'rgba(255,0,0,0.85)' }}
      >
        <span
          className="font-mono font-black text-5xl tracking-tighter uppercase"
          style={{ color: '#faf9f6', transform: 'rotate(-12deg)' }}
        >
          TRASH
        </span>
      </motion.div>

      {/* ARCHIVE — blue */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: archiveOpacity, backgroundColor: 'rgba(37,99,235,0.85)' }}
      >
        <span
          className="font-mono font-black text-5xl tracking-tighter uppercase"
          style={{ color: '#faf9f6', transform: 'rotate(-12deg)' }}
        >
          ARCHIVE
        </span>
      </motion.div>
    </motion.div>
  );
});

export default function CardStack({ emails, onSwipe, onOpenDetail, onUnsubscribe, stats, fetchError, onRetry }) {
  const exitDirectionRef = useRef('right');

  const setDirection = useCallback((dir) => {
    exitDirectionRef.current = dir;
  }, []);

  const handleSwipeWithDirection = useCallback((email, action) => {
    onSwipe(email, action);
  }, [onSwipe]);

  if (!emails || emails.length === 0) {
    // Fetch error state
    if (fetchError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center font-mono px-6">
          <div className="w-full max-w-sm border-[3px] border-black p-6 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#ff0000] flex items-center justify-center text-white font-black text-sm">!</div>
              <h2 className="text-base font-black text-black uppercase tracking-tight">FETCH FAILED</h2>
            </div>
            <p className="text-xs text-black/50 uppercase tracking-wider mb-5 leading-relaxed">
              COULD NOT LOAD YOUR EMAILS. CHECK YOUR CONNECTION AND TRY AGAIN.
            </p>
            <button
              onClick={onRetry}
              className="w-full py-2.5 bg-black text-white text-xs font-black uppercase tracking-widest cursor-pointer border-none font-mono hover:bg-[#ff0000] transition-colors duration-150"
            >
              RETRY
            </button>
          </div>
        </div>
      );
    }

    // Inbox zero — user triaged everything
    const triaged = stats?.total > 0;
    return (
      <div className="flex-1 flex flex-col items-center justify-center font-mono px-6">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Animated check square */}
          <motion.div
            className="w-16 h-16 border-[3px] border-black flex items-center justify-center mb-5"
            initial={{ scale: 0.5, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <motion.svg
              width="32" height="32" viewBox="0 0 32 32" fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            >
              <motion.path
                d="M8 16L14 22L24 10"
                stroke="black"
                strokeWidth="3.5"
                strokeLinecap="square"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              />
            </motion.svg>
          </motion.div>

          <motion.h2
            className="text-2xl font-black text-black uppercase tracking-tighter mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {triaged ? 'INBOX ZERO' : 'ALL CLEAR'}
          </motion.h2>

          <motion.p
            className="text-xs text-black/50 uppercase tracking-wider mb-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {triaged
              ? 'GREAT JOB. YOU TRIAGED YOUR ENTIRE INBOX.'
              : 'NO EMAILS TO TRIAGE RIGHT NOW.'}
          </motion.p>

          {/* Stats summary — only show if user triaged something */}
          {triaged && (
            <motion.div
              className="flex gap-0 border-[2px] border-black"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-1.5 px-3 py-2">
                <div className="w-2 h-2 bg-[#16a34a]" />
                <span className="text-xs font-black tabular-nums">{stats.kept || 0}</span>
              </div>
              <div className="border-l-[2px] border-black/15" />
              <div className="flex items-center gap-1.5 px-3 py-2">
                <div className="w-2 h-2 bg-[#2563eb]" />
                <span className="text-xs font-black tabular-nums">{stats.archived || 0}</span>
              </div>
              <div className="border-l-[2px] border-black/15" />
              <div className="flex items-center gap-1.5 px-3 py-2">
                <div className="w-2 h-2 bg-[#ff0000]" />
                <span className="text-xs font-black tabular-nums">{stats.trashed || 0}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm h-[500px] flex items-center justify-center">
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
      <AnimatePresence mode="popLayout" custom={exitDirectionRef.current}>
        <SwipeableCard
          key={emails[0].id}
          email={emails[0]}
          onSwipe={handleSwipeWithDirection}
          onOpenDetail={onOpenDetail}
          onSetDirection={setDirection}
          onUnsubscribe={onUnsubscribe}
        />
      </AnimatePresence>
    </div>
  );
}
