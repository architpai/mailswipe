import React, { useState, useEffect, useRef } from 'react';
import TopNav from './components/TopNav';
import Sidebar from './components/Sidebar';
import CardStack from './components/CardStack';
import DetailView from './components/DetailView';
import Toast from './components/Toast';
import { useAuth } from './hooks/useAuth';
import { useEmails } from './hooks/useEmails';
import { useML } from './hooks/useML';
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
    // Basic fallback - open in new tab if https
    if (email.unsubscribeLink?.startsWith('http')) {
      window.open(email.unsubscribeLink, '_blank', 'noopener,noreferrer');
    } else {
      alert("Mailto unsubscribe not fully implemented yet.");
    }
    // Automatically trash after unsubscribe gesture
    handleActionDetail(email, 'trash');
  };

  if (!token) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h1 className="text-4xl font-extrabold text-blue-600 mb-2">MailSwipe</h1>
        <p className="text-slate-500 mb-8 max-w-xs">Triage your Gmail inbox with simple swipe gestures.</p>
        <button 
          onClick={() => login()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95"
        >
          <LogIn className="w-5 h-5" />
          Connect Gmail
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 relative">
      <TopNav userProfile={userProfile} onLogout={logout} mlStatus={mlStatus} mlProgress={mlProgress} />
      
      <div className="flex-1 flex flex-col items-center p-4 pt-6 overflow-hidden">
        <Sidebar stats={stats} />
        
        <div className="flex-1 w-full flex items-center justify-center relative">
          {isLoading && emails.length === 0 ? (
            <div className="animate-pulse flex flex-col items-center text-slate-400">
              <div className="w-8 h-8 rounded-full border-4 border-slate-300 border-t-blue-500 animate-spin mb-4"></div>
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
