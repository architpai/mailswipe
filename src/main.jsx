import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import App from './versions/v3/App'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import './index.css'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

function Router() {
  const [route, setRoute] = useState(window.location.hash)

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  switch (route) {
    case '#/privacy':
      return <PrivacyPolicy />
    case '#/terms':
      return <TermsOfService />
    default:
      return (
        <GoogleOAuthProvider clientId={clientId}>
          <App />
          <Analytics />
          <SpeedInsights />
        </GoogleOAuthProvider>
      )
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
)
