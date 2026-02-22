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

function App() {
  const { token, userProfile, login, logout } = useAuth();
  const { emails, setEmails, handleAction, undoAction, stats, isLoading } = useEmails(token);
  const { isReady, mlStatus, mlProgress, analyzeEmails } = useML();

  const [selectedEmail, setSelectedEmail] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const emailsRef = useRef(emails);
  emailsRef.current = emails;

  // Only trigger ML analysis when new emails arrive (length changes), not on every re-render
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

  // Login Screen
  if (!token) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0f] p-6 text-center relative overflow-hidden">
        {/* CSS Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Radial glow behind title */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, rgba(168,85,247,0.04) 40%, transparent 70%)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center">
          <h1
            className="text-5xl font-extrabold text-white mb-3 neon-title"
            style={{
              textShadow:
                '0 0 10px rgba(0,212,255,0.5), 0 0 20px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.2), 0 0 80px rgba(0,212,255,0.1)',
            }}
          >
            Mail<span className="text-[#00d4ff]">Swipe</span>
          </h1>

          <p className="text-white/50 mb-10 max-w-xs text-sm">
            Triage your Gmail inbox with simple swipe gestures.
          </p>

          <button
            onClick={() => login()}
            className="bg-[#00d4ff] hover:bg-[#00bbdd] text-[#0a0a0f] font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all active:scale-95"
            style={{
              boxShadow:
                '0 0 15px rgba(0,212,255,0.4), 0 0 30px rgba(0,212,255,0.2), 0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            <LogIn className="w-5 h-5" />
            Connect Gmail
          </button>
        </div>

        {/* Neon glow pulse animation */}
        <style>{`
          .neon-title {
            animation: neonPulse 4s ease-in-out infinite;
          }
          @keyframes neonPulse {
            0%, 100% {
              text-shadow:
                0 0 10px rgba(0,212,255,0.5),
                0 0 20px rgba(0,212,255,0.3),
                0 0 40px rgba(0,212,255,0.2),
                0 0 80px rgba(0,212,255,0.1);
            }
            33% {
              text-shadow:
                0 0 10px rgba(255,45,123,0.5),
                0 0 20px rgba(255,45,123,0.3),
                0 0 40px rgba(255,45,123,0.2),
                0 0 80px rgba(255,45,123,0.1);
            }
            66% {
              text-shadow:
                0 0 10px rgba(168,85,247,0.5),
                0 0 20px rgba(168,85,247,0.3),
                0 0 40px rgba(168,85,247,0.2),
                0 0 80px rgba(168,85,247,0.1);
            }
          }
        `}</style>
      </div>
    );
  }

  // Authenticated View
  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0f] relative overflow-hidden">
      {/* Subtle grid pattern on background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <TopNav userProfile={userProfile} onLogout={logout} mlStatus={mlStatus} mlProgress={mlProgress} />

      <div className="flex-1 flex flex-col items-center p-4 pt-6 overflow-hidden relative z-10">
        <Sidebar stats={stats} />

        <div className="flex-1 w-full flex items-center justify-center relative">
          {isLoading && emails.length === 0 ? (
            <div className="animate-pulse flex flex-col items-center text-white/40">
              <div
                className="w-8 h-8 rounded-full border-4 border-white/10 border-t-[#00d4ff] animate-spin mb-4"
                style={{ boxShadow: '0 0 15px rgba(0,212,255,0.2)' }}
              ></div>
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
