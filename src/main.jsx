import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import VersionPicker from './VersionPicker'
import V1App from './versions/v1/App'
import V2App from './versions/v2/App'
import V3App from './versions/v3/App'
import V4App from './versions/v4/App'
import V5App from './versions/v5/App'
import './index.css'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VersionPicker />} />
          <Route path="/1" element={<V1App />} />
          <Route path="/2" element={<V2App />} />
          <Route path="/3" element={<V3App />} />
          <Route path="/4" element={<V4App />} />
          <Route path="/5" element={<V5App />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
