import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import CardStack from './CardStack';
import DetailView from './DetailView';
import Toast from './Toast';
import Settings from './Settings';
import { useAuth } from '../../hooks/useAuth';
import { useEmails } from '../../hooks/useEmails';
import { useML } from '../../hooks/useML';
import { useSettings } from '../../hooks/useSettings';
import { useSwipePredictor } from '../../hooks/useSwipePredictor';

// ── Demo sequence for landing page ──────────────────────────────────
const DEMO_STEPS = [
  {
    from: 'NEWSLETTER CO.',
    subject: 'YOUR WEEKLY DIGEST',
    snippet: 'THE TOP STORIES YOU MISSED THIS WEEK AND MORE...',
    tag: 'NEWSLETTER',
    direction: 'right',
    exitX: 600,
    exitY: 0,
    exitRotate: 18,
    label: 'KEEP →',
    labelColor: '#16a34a',
    callout: 'AI SORTS. YOU DECIDE.',
  },
  {
    from: 'PROMO@DEALS.COM',
    subject: '50% OFF EVERYTHING',
    snippet: 'LIMITED TIME OFFER. USE CODE SAVE50 AT CHECKOUT...',
    tag: 'SPAM',
    direction: 'left',
    exitX: -600,
    exitY: 0,
    exitRotate: -18,
    label: '← TRASH',
    labelColor: '#ff0000',
    callout: 'ONE SWIPE. GONE.',
  },
  {
    from: 'TEAM@WORK.CO',
    subject: 'Q4 PLANNING NOTES',
    snippet: 'ATTACHED ARE THE NOTES FROM FRIDAY\'S SESSION...',
    tag: 'WORK',
    direction: 'up',
    exitX: 0,
    exitY: -600,
    exitRotate: 0,
    label: '↑ ARCHIVE',
    labelColor: '#2563eb',
    callout: 'SAVE FOR LATER. INSTANTLY.',
  },
  {
    from: 'DEALS@MEGASTORE.COM',
    subject: 'FLASH SALE 80% OFF',
    snippet: 'UNBELIEVABLE DEALS ON ELECTRONICS, FASHION AND MORE...',
    tag: 'SPAM',
    direction: 'left',
    exitX: -600,
    exitY: 0,
    exitRotate: -18,
    label: '← TRASH',
    labelColor: '#ff0000',
    callout: 'LEARNS AS YOU SWIPE.',
    tintColor: 'rgb(246, 217, 217)',
  },
  {
    from: 'ALEX',
    subject: 'PARTY THIS SATURDAY!',
    snippet: 'HEY! THROWING A PARTY AT MY PLACE THIS WEEKEND. YOU IN?',
    tag: 'PERSONAL',
    direction: 'right',
    exitX: 600,
    exitY: 0,
    exitRotate: 18,
    label: 'KEEP →',
    labelColor: '#16a34a',
    callout: 'SUGGESTS ACTIONS. YOU STAY IN CONTROL.',
    tintColor: 'rgb(216, 245, 228)',
  },
];

const PAUSE_STEP = {
  label: '',
  callout: 'UNDO ANYTIME. POWERED BY GMAIL.',
  labelColor: '#000',
};

// ── Demo card component ─────────────────────────────────────────────
// Only AnimatePresence drives exit — no manual animate-to-exit.
function DemoCard({ step, isSwiping }) {
  return (
    <motion.div
      className="absolute w-[280px] sm:w-[320px] border-[3px] border-black p-5 select-none"
      style={{ fontFamily: 'monospace', backgroundColor: step.tintColor || '#ffffff' }}
      initial={{ x: 0, y: 30, rotate: 0, opacity: 0, scale: 0.95 }}
      animate={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
      exit={{
        x: step.exitX,
        y: step.exitY,
        rotate: step.exitRotate,
        opacity: 0,
        scale: 0.9,
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Tag */}
      <div className="inline-block bg-black text-white text-[10px] font-bold tracking-wider px-2 py-0.5 mb-3 uppercase">
        {step.tag}
      </div>

      {/* From */}
      <div className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-bold mb-1">
        FROM: {step.from}
      </div>

      {/* Subject */}
      <div className="text-base sm:text-lg font-black uppercase tracking-tight leading-tight text-black mb-2">
        {step.subject}
      </div>

      {/* Snippet */}
      <div className="text-xs text-black/40 uppercase tracking-wide leading-relaxed">
        {step.snippet}
      </div>

      {/* Bottom rule */}
      <div className="mt-4 pt-3 border-t-[2px] border-black/10 flex justify-between items-center">
        <span className="text-[9px] uppercase tracking-widest text-black/30 font-bold">2 HOURS AGO</span>
        <span className="text-[9px] uppercase tracking-widest text-black/30 font-bold">TAP TO VIEW</span>
      </div>

      {/* Swipe direction overlay — fades in before exit */}
      <AnimatePresence>
        {isSwiping && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            style={{
              backgroundColor:
                step.direction === 'left'
                  ? 'rgba(255,0,0,0.9)'
                  : step.direction === 'right'
                  ? 'rgba(22,163,74,0.1)'
                  : 'rgba(37,99,235,0.1)',
            }}
          >
            <span
              className="text-3xl sm:text-4xl font-black uppercase tracking-tight"
              style={{
                color: step.direction === 'left' ? '#fff' : step.labelColor,
                borderBottom:
                  step.direction === 'right'
                    ? `4px solid ${step.labelColor}`
                    : step.direction === 'up'
                    ? `4px solid ${step.labelColor}`
                    : 'none',
                transform:
                  step.direction === 'right'
                    ? 'rotate(12deg)'
                    : step.direction === 'left'
                    ? 'rotate(-12deg)'
                    : 'none',
              }}
            >
              {step.direction === 'right' ? 'KEEP' : step.direction === 'left' ? 'TRASH' : 'ARCHIVE'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Landing page ────────────────────────────────────────────────────
// State machine: idle → swiping (overlay shows) → exiting (card unmounts) → idle/pausing
function LandingPage({ onLogin }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [showCard, setShowCard] = useState(true);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const timerRef = useRef(null);

  const currentStep = DEMO_STEPS[stepIndex];

  // Phase 1: Card is visible and idle → after delay, show swipe overlay
  useEffect(() => {
    if (showCard && !isSwiping) {
      timerRef.current = setTimeout(() => setIsSwiping(true), 1800);
      return () => clearTimeout(timerRef.current);
    }
  }, [showCard, isSwiping]);

  // Phase 2: Overlay is showing → after brief display, remove card (triggers exit)
  useEffect(() => {
    if (showCard && isSwiping) {
      timerRef.current = setTimeout(() => setShowCard(false), 400);
      return () => clearTimeout(timerRef.current);
    }
  }, [showCard, isSwiping]);

  // Phase 3: AnimatePresence exit completes → advance to next step
  const handleExitComplete = useCallback(() => {
    setIsSwiping(false);
    const nextIndex = (stepIndex + 1) % DEMO_STEPS.length;

    if (nextIndex === 0) {
      // Pause before looping
      setIsPausing(true);
      timerRef.current = setTimeout(() => {
        setIsPausing(false);
        setStepIndex(0);
        setShowCard(true);
      }, 2500);
    } else {
      setStepIndex(nextIndex);
      setShowCard(true);
    }
  }, [stepIndex]);

  // Callout text
  const calloutText = isPausing
    ? PAUSE_STEP.callout
    : currentStep.callout;
  const labelText = isSwiping ? currentStep.label : '';
  const labelColor = isPausing ? PAUSE_STEP.labelColor : currentStep.labelColor;

  return (
    <div
      className="w-full h-full flex flex-col bg-white overflow-hidden font-mono select-none"
      style={{ fontFamily: 'monospace' }}
    >
      {/* ── Header ─────────────────────────────── */}
      <div className="flex-none pt-6 sm:pt-10 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 bg-[#ff0000]" />
          <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tighter uppercase leading-none">
            MAILSWIPE
          </h1>
          <div className="w-2.5 h-2.5 bg-[#ff0000]" />
        </div>
        <p className="text-[10px] sm:text-xs text-black/40 uppercase tracking-[0.2em] font-bold">
          SWIPE YOUR INBOX CLEAN
        </p>
      </div>

      {/* ── Demo area ──────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center relative min-h-0 px-4">
        {/* Direction hints — small static indicators */}
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-2 sm:px-8">
          <motion.div
            className="text-[10px] font-black uppercase tracking-wider text-black/10"
            animate={{
              opacity: isSwiping && currentStep.direction === 'left' ? 0.6 : 0.1,
              x: isSwiping && currentStep.direction === 'left' ? -4 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            ← TRASH
          </motion.div>
          <motion.div
            className="text-[10px] font-black uppercase tracking-wider text-black/10"
            animate={{
              opacity: isSwiping && currentStep.direction === 'right' ? 0.6 : 0.1,
              x: isSwiping && currentStep.direction === 'right' ? 4 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            KEEP →
          </motion.div>
        </div>

        {/* Top direction hint */}
        <motion.div
          className="absolute top-2 text-[10px] font-black uppercase tracking-wider text-black/10"
          animate={{
            opacity: isSwiping && currentStep.direction === 'up' ? 0.6 : 0.1,
            y: isSwiping && currentStep.direction === 'up' ? -4 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          ↑ ARCHIVE
        </motion.div>

        {/* The demo card */}
        <div className="relative w-[280px] sm:w-[320px] h-[220px] sm:h-[240px] flex items-center justify-center">
          <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
            {showCard && (
              <DemoCard
                key={stepIndex}
                step={currentStep}
                isSwiping={isSwiping}
              />
            )}
          </AnimatePresence>

          {/* Pause state — no card, just the message */}
          <AnimatePresence>
            {isPausing && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="border-[3px] border-dashed border-black/15 w-full h-full flex items-center justify-center">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-black/30">
                    INBOX ZERO
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Callout text — synchronized with swipe */}
        <div className="mt-5 h-14 flex flex-col items-center justify-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${stepIndex}-${isSwiping}-${isPausing}`}
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {labelText && (
                <span
                  className="text-sm sm:text-base font-black uppercase tracking-tight"
                  style={{ color: labelColor }}
                >
                  {labelText}
                </span>
              )}
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] text-black/50">
                {calloutText}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Footer / Connect ───────────────────── */}
      <div className="flex-none pb-8 sm:pb-10 px-6 flex flex-col items-center">
        <button
          onClick={onLogin}
          className="group relative text-sm font-black text-black uppercase tracking-tight cursor-pointer bg-transparent border-none p-0 font-mono"
        >
          <span className="relative z-10 px-1 group-hover:text-[#ff0000] transition-colors duration-150">
            CONNECT GMAIL &rarr;
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black group-hover:bg-[#ff0000] transition-colors duration-150" />
        </button>
      </div>
    </div>
  );
}

function App() {
  const { token, userProfile, login, logout } = useAuth();
  const { emails, setEmails, handleAction, undoAction, stats, isLoading, fetchError, loadMore } = useEmails(token);
  const { isReady, mlStatus, mlProgress, analyzeEmails } = useML();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { predict, train, modelReady } = useSwipePredictor();
  const [showSettings, setShowSettings] = useState(false);

  const [selectedEmail, setSelectedEmail] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const emailsRef = useRef(emails);
  emailsRef.current = emails;

  // Predict swipe action for the top email (recomputes only when top email changes)
  const topEmail = emails.length > 0 ? emails[0] : null;
  const predictions = useMemo(
    () => (topEmail ? predict(topEmail) : null),
    [topEmail, predict]
  );

  // Only trigger ML analysis when new emails arrive (length changes), not on every re-render
  useEffect(() => {
    if (emails.length > 0 && isReady) {
      analyzeEmails(emailsRef.current, setEmails);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emails.length, isReady]);

  const handleSwipe = (email, direction) => {
    const actionConfig = settings.swipeActions[direction];
    handleAction(email, direction, actionConfig);
    setLastAction({ email, direction, actionConfig });
    // Note: undo does not reverse training — a single reversed sample has diminishing impact
    train(email, direction);
  };

  const handleActionDetail = (email, direction) => {
    const actionConfig = settings.swipeActions[direction];
    handleAction(email, direction, actionConfig);
    setLastAction({ email, direction, actionConfig });
    train(email, direction);
    setSelectedEmail(null);
  };

  const handleUnsubscribe = (email) => {
    if (email.unsubscribeLink?.startsWith('http')) {
      window.open(email.unsubscribeLink, '_blank', 'noopener,noreferrer');
    } else {
      alert('Mailto unsubscribe not fully implemented yet.');
    }
    const trashDir = Object.entries(settings.swipeActions).find(([_, cfg]) => cfg.type === 'trash')?.[0] || 'left';
    const actionConfig = settings.swipeActions[trashDir];
    handleAction(email, trashDir, actionConfig);
  };

  // Login Screen
  if (!token) {
    return <LandingPage onLogin={login} />;
  }

  // Authenticated View
  return (
    <div className="w-full h-full flex flex-col bg-white relative overflow-hidden font-mono">
      <TopNav userProfile={userProfile} onLogout={logout} mlStatus={mlStatus} mlProgress={mlProgress} onOpenSettings={() => setShowSettings(true)} />

      <div className="flex-1 flex flex-col items-center p-4 pt-6 overflow-hidden relative z-10 max-w-md mx-auto w-full">
        <Sidebar stats={stats} settings={settings} />

        <div className="flex-1 w-full flex items-center justify-center relative">
          {isLoading && emails.length === 0 ? (
            <div className="flex flex-col items-center text-black font-mono">
              <div className="w-4 h-4 bg-black animate-pulse mb-4"></div>
              <p className="text-xs uppercase tracking-widest font-bold">FETCHING EMAILS...</p>
            </div>
          ) : (
            <CardStack
              emails={emails}
              onSwipe={handleSwipe}
              onOpenDetail={(email) => setSelectedEmail(email)}
              onUnsubscribe={handleUnsubscribe}
              stats={stats}
              fetchError={fetchError}
              onRetry={loadMore}
              dragEnabled={!selectedEmail}
              settings={settings}
              predictions={predictions}
              modelReady={modelReady}
            />
          )}
        </div>
      </div>

      {selectedEmail && (
        <DetailView
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onAction={handleActionDetail}
          onUnsubscribe={handleUnsubscribe}
          settings={settings}
        />
      )}

      <Toast
        lastAction={lastAction}
        onUndo={({ email, direction, actionConfig }) => undoAction(email, direction, actionConfig)}
        onDismiss={() => setLastAction(null)}
      />

      <AnimatePresence>
        {showSettings && (
          <Settings
            settings={settings}
            onSave={updateSettings}
            onReset={resetSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
