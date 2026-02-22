import React, { useState, useEffect, useRef } from 'react';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import CardStack from './CardStack';
import DetailView from './DetailView';
import Toast from './Toast';
import { useAuth } from '../../hooks/useAuth';
import { useEmails } from '../../hooks/useEmails';
import { useML } from '../../hooks/useML';

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

  // ── Login Screen — Newspaper Masthead ──
  if (!token) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center bg-[#faf8f2] p-6 text-center"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        <div className="flex flex-col items-center max-w-sm w-full">
          {/* Thin decorative rule at top */}
          <div className="w-full border-t border-[#1a1a1a]/20 mb-1" />
          <div className="w-full border-t-2 border-[#c41e3a] mb-6" />

          {/* Masthead title */}
          <h1 className="italic text-5xl sm:text-6xl font-bold text-[#1a1a1a] mb-2">
            MailSwipe
          </h1>

          {/* Establishment line */}
          <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-[#b8860b] mb-4">
            Est. 2024
          </span>

          {/* Decorative rules below title */}
          <div className="w-full border-t-2 border-[#c41e3a] mb-1" />
          <div className="w-full border-t border-[#1a1a1a]/20 mb-6" />

          {/* Tagline */}
          <p className="italic text-[#1a1a1a]/60 text-base mb-10 max-w-xs leading-relaxed">
            Triage your Gmail inbox with simple, elegant swipe gestures.
          </p>

          {/* Sign-in as understated serif text link */}
          <button
            onClick={() => login()}
            className="text-sm text-[#1a1a1a]/50 hover:text-[#c41e3a] transition-colors underline underline-offset-4 decoration-[#1a1a1a]/20 hover:decoration-[#c41e3a]"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Sign in with Google &rarr;
          </button>
        </div>
      </div>
    );
  }

  // ── Authenticated View ──
  return (
    <div
      className="w-full h-full flex flex-col bg-[#faf8f2] relative overflow-hidden"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      <TopNav userProfile={userProfile} onLogout={logout} mlStatus={mlStatus} mlProgress={mlProgress} />

      <div className="flex-1 flex flex-col items-center p-4 pt-6 overflow-hidden">
        <div className="max-w-md w-full mx-auto">
          <Sidebar stats={stats} />
        </div>

        <div className="flex-1 w-full max-w-md mx-auto flex items-center justify-center relative">
          {isLoading && emails.length === 0 ? (
            <div
              className="animate-pulse flex flex-col items-center text-[#1a1a1a]/40"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              <div className="w-6 h-6 border-2 border-[#1a1a1a]/10 border-t-[#c41e3a] rounded-full animate-spin mb-4" />
              <p className="italic">Fetching the latest edition...</p>
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
