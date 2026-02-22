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
      <div className="w-full h-full flex flex-col items-center justify-center bg-white p-6 text-center relative overflow-hidden font-mono">
        <div className="relative z-10 flex flex-col items-center">
          {/* Red dot accent */}
          <div className="w-3 h-3 bg-[#ff0000] rounded-none mb-6"></div>

          <h1 className="text-6xl sm:text-8xl font-black text-black tracking-tighter uppercase leading-none mb-4">
            MAILSWIPE
          </h1>

          <p className="text-xs text-black uppercase tracking-widest mb-12 font-mono">
            TRIAGE YOUR INBOX. SWIPE TO DECIDE.
          </p>

          <a
            onClick={() => login()}
            className="text-sm font-bold text-black uppercase tracking-tight underline underline-offset-4 decoration-black cursor-pointer hover:text-[#ff0000] hover:decoration-[#ff0000] transition-colors font-mono select-none"
          >
            CONNECT &rarr;
          </a>
        </div>
      </div>
    );
  }

  // Authenticated View
  return (
    <div className="w-full h-full flex flex-col bg-white relative overflow-hidden font-mono">
      <TopNav userProfile={userProfile} onLogout={logout} mlStatus={mlStatus} mlProgress={mlProgress} />

      <div className="flex-1 flex flex-col items-center p-4 pt-6 overflow-hidden relative z-10 max-w-md mx-auto w-full">
        <Sidebar stats={stats} />

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
