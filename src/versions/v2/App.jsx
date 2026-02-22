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
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#fdf6ee] p-6 text-center relative overflow-hidden">
        {/* Floating CSS blob shapes */}
        <div
          className="absolute blob-shape"
          style={{
            width: '280px',
            height: '280px',
            top: '10%',
            left: '-5%',
            background: 'rgba(255,184,140,0.25)',
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            filter: 'blur(40px)',
            animation: 'blobFloat1 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute blob-shape"
          style={{
            width: '240px',
            height: '240px',
            top: '60%',
            right: '-8%',
            background: 'rgba(163,177,138,0.22)',
            borderRadius: '40% 60% 70% 30% / 40% 70% 30% 60%',
            filter: 'blur(35px)',
            animation: 'blobFloat2 10s ease-in-out infinite',
          }}
        />
        <div
          className="absolute blob-shape"
          style={{
            width: '200px',
            height: '200px',
            top: '25%',
            right: '10%',
            background: 'rgba(200,182,255,0.22)',
            borderRadius: '50% 60% 40% 70% / 50% 40% 60% 50%',
            filter: 'blur(35px)',
            animation: 'blobFloat3 9s ease-in-out infinite',
          }}
        />
        <div
          className="absolute blob-shape"
          style={{
            width: '220px',
            height: '220px',
            bottom: '5%',
            left: '15%',
            background: 'rgba(255,184,140,0.18)',
            borderRadius: '70% 30% 50% 50% / 30% 60% 40% 70%',
            filter: 'blur(40px)',
            animation: 'blobFloat4 11s ease-in-out infinite',
          }}
        />

        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-5xl font-bold text-[#6b4226] mb-3 tracking-wide">
            MailSwipe
          </h1>

          <p className="text-[#6b4226]/50 mb-10 max-w-xs text-sm tracking-wide leading-relaxed">
            Triage your Gmail inbox with simple swipe gestures.
          </p>

          <button
            onClick={() => login()}
            className="font-semibold py-3.5 px-10 rounded-full flex items-center gap-2.5 transition-all active:scale-95 text-white tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #ffb88c 0%, #c8b6ff 100%)',
              boxShadow: '0 8px 30px rgba(255,184,140,0.3), 0 4px 12px rgba(200,182,255,0.2)',
            }}
          >
            <LogIn className="w-5 h-5" />
            Connect Gmail
          </button>
        </div>

        {/* Blob animation keyframes */}
        <style>{`
          @keyframes blobFloat1 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
              border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            }
            33% {
              transform: translate(30px, -20px) scale(1.05);
              border-radius: 40% 60% 50% 50% / 50% 40% 60% 50%;
            }
            66% {
              transform: translate(-15px, 15px) scale(0.95);
              border-radius: 50% 50% 40% 60% / 40% 60% 50% 50%;
            }
          }
          @keyframes blobFloat2 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
              border-radius: 40% 60% 70% 30% / 40% 70% 30% 60%;
            }
            33% {
              transform: translate(-20px, 25px) scale(1.08);
              border-radius: 60% 40% 50% 50% / 60% 50% 40% 50%;
            }
            66% {
              transform: translate(15px, -10px) scale(0.92);
              border-radius: 50% 50% 60% 40% / 50% 40% 50% 60%;
            }
          }
          @keyframes blobFloat3 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
              border-radius: 50% 60% 40% 70% / 50% 40% 60% 50%;
            }
            33% {
              transform: translate(20px, 15px) scale(0.95);
              border-radius: 70% 30% 60% 40% / 40% 60% 30% 70%;
            }
            66% {
              transform: translate(-25px, -20px) scale(1.05);
              border-radius: 40% 60% 50% 50% / 60% 40% 50% 50%;
            }
          }
          @keyframes blobFloat4 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
              border-radius: 70% 30% 50% 50% / 30% 60% 40% 70%;
            }
            33% {
              transform: translate(-10px, -25px) scale(1.06);
              border-radius: 50% 50% 40% 60% / 50% 40% 60% 50%;
            }
            66% {
              transform: translate(20px, 10px) scale(0.94);
              border-radius: 60% 40% 60% 40% / 40% 60% 40% 60%;
            }
          }
        `}</style>
      </div>
    );
  }

  // Authenticated View
  return (
    <div className="w-full h-full flex flex-col bg-[#fdf6ee] relative overflow-hidden">
      <TopNav userProfile={userProfile} onLogout={logout} mlStatus={mlStatus} mlProgress={mlProgress} />

      <div className="flex-1 flex flex-col items-center p-4 pt-6 overflow-hidden relative z-10 max-w-md mx-auto w-full">
        <Sidebar stats={stats} />

        <div className="flex-1 w-full flex items-center justify-center relative">
          {isLoading && emails.length === 0 ? (
            <div className="animate-pulse flex flex-col items-center text-[#6b4226]/45">
              <div className="w-8 h-8 rounded-full border-4 border-[#fdf6ee] border-t-[#ffb88c] animate-spin mb-4"></div>
              <p className="tracking-wide">Fetching emails...</p>
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
