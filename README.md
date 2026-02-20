# 📬 MailSwipe

A **Tinder-style Gmail triage app** — swipe through your inbox to keep, archive, or trash emails with satisfying card gestures. Built entirely client-side with on-device ML for smart email classification and summarization.

---

## ✨ Features

- **Swipe to triage** — Right to keep, left to trash, up to archive
- **AI-powered tagging** — Zero-shot classification labels emails as `Work`, `Personal`, `Newsletter`, `Receipt`, `Alert`, or `Spam`
- **Smart summaries** — DistilBART generates concise summaries for long emails
- **Detail view** — Long-press any card to read the full email with safe HTML rendering
- **Undo** — Accidentally trashed? Hit undo within 4 seconds
- **Unsubscribe** — One-tap unsubscribe using `List-Unsubscribe` headers
- **Keyboard shortcuts** — `←` Trash · `→` Keep · `↑` Archive · `Space` Detail view
- **100% client-side** — No backend, no data leaves your browser

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React + Vite |
| Styling | Tailwind CSS |
| Auth | Google Identity Services (`@react-oauth/google`) |
| Gmail API | `gapi-script` |
| Animations | Framer Motion |
| ML Inference | Transformers.js (ONNX Runtime WASM) |
| Sanitization | DOMPurify |

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- A Google Cloud project with **Gmail API** enabled
- OAuth 2.0 Client ID (Web application type) with `http://localhost:5173` as an authorized origin

### 1. Clone & Install

```bash
git clone <repo-url>
cd mailswipe
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Google OAuth Client ID:

```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 3. Download ML Models

The app uses two locally-served ML models (~435 MB total). Download them once:

```bash
bash scripts/download-models.sh
```

This fetches quantized ONNX models from Hugging Face and places them in `public/models/`.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), click **Connect Gmail**, and start swiping!

## 📁 Project Structure

```
mailswipe/
├── public/
│   └── models/              # ML model files (gitignored)
├── scripts/
│   └── download-models.sh   # Model download helper
├── src/
│   ├── components/
│   │   ├── Card.jsx          # Individual email card
│   │   ├── CardStack.jsx     # Swipeable card deck
│   │   ├── DetailView.jsx    # Full email reader modal
│   │   ├── Sidebar.jsx       # Triage stats panel
│   │   ├── Toast.jsx         # Undo notification
│   │   └── TopNav.jsx        # User profile & ML status
│   ├── gmail/
│   │   └── api.js            # Gmail API wrappers
│   ├── hooks/
│   │   ├── useAuth.js        # Google OAuth flow
│   │   ├── useEmails.js      # Email queue & actions
│   │   └── useML.js          # Web Worker bridge
│   ├── ml/
│   │   └── worker.js         # Transformers.js Web Worker
│   ├── utils/
│   │   └── parser.js         # Email header parsing
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .gitignore
├── package.json
└── vite.config.js
```

## 🤖 ML Models

| Model | Task | Size |
|---|---|---|
| `Xenova/nli-deberta-v3-small` | Zero-shot classification | 164 MB |
| `Xenova/distilbart-cnn-6-6` | Summarization | 271 MB |

Models run **entirely in-browser** via ONNX Runtime WASM inside a Web Worker, keeping the UI thread smooth at 60fps. If models fail to load, the app gracefully falls back to rule-based keyword matching.

## 🔑 Required Google API Scopes

- `gmail.modify` — Read emails, modify labels, trash/untrash
- `gmail.labels` — Create and manage the `MailSwipe/Kept` label

## 📄 License

MIT
