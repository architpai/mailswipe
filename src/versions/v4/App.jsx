import React, { useState, useEffect, useRef } from 'react';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import CardStack from './CardStack';
import DetailView from './DetailView';
import Toast from './Toast';
import { useAuth } from '../../hooks/useAuth';
import { useEmails } from '../../hooks/useEmails';
import { useML } from '../../hooks/useML';
import { LogIn } from 'lucide-react';

/* ─── Aurora Gradient Mesh Background ──────────────────────────────── */
function AuroraBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#0f0f1a' }}>
      {/* Teal blob */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-40 blur-[120px]"
        style={{
          background: '#0d9488',
          animation: 'aurora1 8s ease-in-out infinite alternate',
          top: '-10%',
          left: '-10%',
        }}
      />
      {/* Violet blob */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-40 blur-[120px]"
        style={{
          background: '#7c3aed',
          animation: 'aurora2 10s ease-in-out infinite alternate',
          top: '30%',
          right: '-5%',
        }}
      />
      {/* Indigo blob */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-30 blur-[100px]"
        style={{
          background: '#4f46e5',
          animation: 'aurora3 12s ease-in-out infinite alternate',
          bottom: '-5%',
          left: '20%',
        }}
      />
      {/* Pink blob */}
      <div
        className="absolute w-[350px] h-[350px] rounded-full opacity-35 blur-[100px]"
        style={{
          background: '#ec4899',
          animation: 'aurora4 9s ease-in-out infinite alternate',
          top: '10%',
          left: '40%',
        }}
      />
    </div>
  );
}

/* ─── Keyframe animations injected via style tag ───────────────────── */
function AuroraKeyframes() {
  return (
    <style>{`
      @keyframes aurora1 {
        0%   { transform: translate(0, 0) scale(1); }
        100% { transform: translate(80px, 40px) scale(1.2); }
      }
      @keyframes aurora2 {
        0%   { transform: translate(0, 0) scale(1); }
        100% { transform: translate(-60px, 30px) scale(1.15); }
      }
      @keyframes aurora3 {
        0%   { transform: translate(0, 0) scale(1); }
        100% { transform: translate(40px, -50px) scale(1.1); }
      }
      @keyframes aurora4 {
        0%   { transform: translate(0, 0) scale(1); }
        100% { transform: translate(-30px, 60px) scale(1.25); }
      }
    `}</style>
  );
}

/* ─── Main App ─────────────────────────────────────────────────────── */
function App() {
  const { token, userProfile, login, logout } = useAuth();
  const { emails, setEmails, handleAction, undoAction, stats, isLoading } = useEmails(token);
  const { isReady, mlStatus, mlProgress, analyzeEmails } = useML();

  const [selectedEmail, setSelectedEmail] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const emailsRef = useRef(emails);
  emailsRef.current = emails;

  // Only trigger ML analysis when new emails arrive (length changes)
  useEffect(() => {
    if (emails.length > 0 && isReady) {
      analyzeEmails(emailsRef.current, setEmails);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emails.length, isReady]);

  const handleSwipe = (email, action) => {
    handleAction(email, action);
    setLastAction({ email, action });
  };

  const handleActionDetail = (email, action) => {
    handleAction(email, action);
    setSelectedEmail(null);
  };

  const handleUnsubscribe = (email) => {
    if (email.unsubscribeLink?.startsWith('http')) {
      window.open(email.unsubscribeLink, '_blank', 'noopener,noreferrer');
    } else {
      alert('Mailto unsubscribe not fully implemented yet.');
    }
    handleActionDetail(email, 'trash');
  };

  // ── Login Screen ──
  if (!token) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <AuroraKeyframes />
        <AuroraBackground />

        <div className="relative z-10 flex flex-col items-center">
          {/* Frosted glass login card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-10 flex flex-col items-center shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <h1 className="text-5xl font-light text-white mb-3 tracking-tight">
              MailSwipe
            </h1>

            <p className="text-white/60 mb-10 max-w-xs text-sm">
              Triage your Gmail inbox with simple swipe gestures.
            </p>

            <button
              onClick={() => login()}
              className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-8 rounded-xl flex items-center gap-2 transition-all active:scale-95 border border-white/20 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              <LogIn className="w-5 h-5" />
              Connect Gmail
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Authenticated View ──
  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      <AuroraKeyframes />
      <AuroraBackground />

      <div className="relative z-10 flex flex-col h-full">
        <TopNav userProfile={userProfile} onLogout={logout} mlStatus={mlStatus} mlProgress={mlProgress} />

        <div className="flex-1 flex flex-col items-center p-4 pt-6 overflow-hidden">
          <div className="max-w-md w-full mx-auto">
            <Sidebar stats={stats} />
          </div>

          <div className="flex-1 w-full max-w-md mx-auto flex items-center justify-center relative">
            {isLoading && emails.length === 0 ? (
              <div className="animate-pulse flex flex-col items-center text-white/40">
                <div className="w-8 h-8 rounded-full border-4 border-white/10 border-t-white/60 animate-spin mb-4"></div>
                <p>Fetching emails...</p>
              </div>
            ) : (
              <CardStack
                emails={emails}
                onSwipe={handleSwipe}
                onOpenDetail={(email) => setSelectedEmail(email)}
              />
            )}
          </div>
        </div>
      </div>

      {selectedEmail && (
        <DetailView
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onAction={handleActionDetail}
          onUnsubscribe={handleUnsubscribe}
        />
      )}

      <Toast
        lastAction={lastAction}
        onUndo={({ email, action }) => undoAction(email, action)}
        onDismiss={() => setLastAction(null)}
      />
    </div>
  );
}

export default App;
