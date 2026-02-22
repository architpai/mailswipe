# MailSwipe 5 UI Versions — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create 5 radically different visual versions of MailSwipe accessible at routes /1 through /5, plus a version picker at /.

**Architecture:** Add react-router-dom for routing. Shared hooks/API layer stays unchanged. Each version gets its own complete component set in `src/versions/vN/`. Root `/` shows a version picker linking to all 5.

**Tech Stack:** React 18, Vite, Tailwind CSS 3, Framer Motion, Lucide React, react-router-dom (new)

**Design doc:** `docs/plans/2026-02-22-ui-redesign-5-versions-design.md`

---

### Task 1: Add routing infrastructure

**Files:**
- Modify: `src/main.jsx`
- Create: `src/VersionPicker.jsx`
- Modify: `index.html` (remove max-w-md constraint from body)

**Step 1: Install react-router-dom**

Run: `npm install react-router-dom`

**Step 2: Update `index.html`**

Remove the `max-w-md` class from `<body>` so each version can control its own width. Keep `h-screen overflow-hidden`.

```html
<body class="bg-gray-50 text-slate-900 h-screen overflow-hidden">
```

**Step 3: Update `src/main.jsx`**

Replace current content with router setup. Import all 5 version App components (stubs for now) and the VersionPicker.

```jsx
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
```

**Step 4: Create `src/VersionPicker.jsx`**

A neutral grid page with 5 cards linking to each version. Each card shows theme name, brief description, and a color swatch preview.

```jsx
import React from 'react';
import { Link } from 'react-router-dom';

const versions = [
  {
    id: 1,
    name: 'Neon Noir',
    description: 'Dark mode with glowing neon accents and cyberpunk gradients',
    colors: ['#0a0a0f', '#00d4ff', '#ff2d7b', '#a855f7'],
  },
  {
    id: 2,
    name: 'Soft Organic',
    description: 'Warm cream backgrounds with peach, sage, and lavender pastels',
    colors: ['#fdf6ee', '#ffb88c', '#a3b18a', '#c8b6ff'],
  },
  {
    id: 3,
    name: 'Brutalist Mono',
    description: 'Black and white with monospace typography and raw edges',
    colors: ['#ffffff', '#000000', '#ff0000', '#000000'],
  },
  {
    id: 4,
    name: 'Aurora Glass',
    description: 'Frosted glass panels over animated gradient mesh backgrounds',
    colors: ['#0d9488', '#7c3aed', '#4f46e5', '#ec4899'],
  },
  {
    id: 5,
    name: 'Newspaper / Editorial',
    description: 'Serif typography with elegant rules and editorial styling',
    colors: ['#faf8f2', '#1a1a1a', '#c41e3a', '#b8860b'],
  },
];

export default function VersionPicker() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2">MailSwipe</h1>
      <p className="text-slate-500 mb-10">Choose a visual version to explore</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full">
        {versions.map((v) => (
          <Link
            key={v.id}
            to={`/${v.id}`}
            className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex gap-1.5 mb-4">
              {v.colors.map((c, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-lg border border-slate-200"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">
              {v.id}. {v.name}
            </h2>
            <p className="text-sm text-slate-500">{v.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

**Step 5: Create stub App.jsx for all 5 versions**

Create the directory structure and stub files so routing works:
- `src/versions/v1/App.jsx`
- `src/versions/v2/App.jsx`
- `src/versions/v3/App.jsx`
- `src/versions/v4/App.jsx`
- `src/versions/v5/App.jsx`

Each stub:
```jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function App() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Version N — Coming Soon</h1>
        <Link to="/" className="text-blue-600 hover:underline">← Back to picker</Link>
      </div>
    </div>
  );
}
```

**Step 6: Verify routing works**

Run: `npm run dev`
Expected: Visit `/` shows version picker, clicking each card navigates to `/1` through `/5` stubs.

**Step 7: Commit**

```bash
git add -A && git commit -m "Add routing infrastructure and version picker"
```

---

### Task 2: Version 1 — Neon Noir

**Files:**
- Create: `src/versions/v1/App.jsx`
- Create: `src/versions/v1/Card.jsx`
- Create: `src/versions/v1/CardStack.jsx`
- Create: `src/versions/v1/TopNav.jsx`
- Create: `src/versions/v1/Sidebar.jsx`
- Create: `src/versions/v1/DetailView.jsx`
- Create: `src/versions/v1/Toast.jsx`

**Design Reference:**
- Palette: Deep black (#0a0a0f), electric blue (#00d4ff), hot pink (#ff2d7b), neon purple (#a855f7)
- Typography: System sans-serif, bold headings with text-shadow glow
- Cards: Dark glass (#1a1a2e + backdrop-blur), neon border glow on hover
- Login: Centered logo with neon glow pulse, dark background with subtle grid pattern
- Stats: Neon-colored counters with glow effects, pill-shaped, dark glass background
- Detail: Full-screen dark overlay, neon accent dividers
- Swipe overlays: Neon green/red/blue glow effects
- Toast: Dark glass with neon accent border

**Step 1: Build all 7 components**

Use the frontend-design skill. All components import from shared hooks (`../../hooks/useAuth`, `../../hooks/useEmails`, `../../hooks/useML`). The App.jsx is a full app shell with login and authenticated views. The card stack, swipe logic, and detail view all follow the same patterns as the original but with Neon Noir styling.

Key Tailwind classes to use heavily:
- `bg-[#0a0a0f]` for backgrounds
- `bg-[#1a1a2e]/80 backdrop-blur-xl` for glass cards
- `shadow-[0_0_20px_rgba(0,212,255,0.3)]` for neon glow
- `text-shadow` via inline style for glowing text
- `border-[#00d4ff]/30` for neon borders

**Step 2: Visual verification**

Run: `npm run dev`, navigate to `/1`
Verify: Dark background, neon glowing cards, login screen with pulse animation, stats bar with neon counters

**Step 3: Commit**

```bash
git add src/versions/v1/ && git commit -m "Add Version 1: Neon Noir"
```

---

### Task 3: Version 2 — Soft Organic

**Files:**
- Create: `src/versions/v2/App.jsx`
- Create: `src/versions/v2/Card.jsx`
- Create: `src/versions/v2/CardStack.jsx`
- Create: `src/versions/v2/TopNav.jsx`
- Create: `src/versions/v2/Sidebar.jsx`
- Create: `src/versions/v2/DetailView.jsx`
- Create: `src/versions/v2/Toast.jsx`

**Design Reference:**
- Palette: Warm cream (#fdf6ee), peach (#ffb88c), sage (#a3b18a), lavender (#c8b6ff), warm brown (#6b4226)
- Typography: Rounded feel, generous line-height, soft letter-spacing
- Cards: White with warm shadow, rounded-3xl, soft gradient top border
- Login: Cream background with CSS blob shapes, pill-shaped peach gradient button
- Stats: Soft pastel pills with matching warm icons
- Detail: Slide-up sheet with extra-rounded top, warm cream header
- Swipe overlays: Soft sage/coral/lavender
- Toast: Warm brown with cream text, very rounded

**Step 1: Build all 7 components**

Use the frontend-design skill. Same shared hooks pattern. Key Tailwind:
- `bg-[#fdf6ee]` for cream backgrounds
- `rounded-3xl` for generous rounding
- `shadow-[0_8px_30px_rgba(107,66,38,0.08)]` for warm shadows
- CSS blobs via positioned `<div>` elements with border-radius animations

**Step 2: Visual verification**

Run: `npm run dev`, navigate to `/2`
Verify: Warm cream tones, soft rounded cards, floating blob shapes on login, pastel stat pills

**Step 3: Commit**

```bash
git add src/versions/v2/ && git commit -m "Add Version 2: Soft Organic"
```

---

### Task 4: Version 3 — Brutalist Mono

**Files:**
- Create: `src/versions/v3/App.jsx`
- Create: `src/versions/v3/Card.jsx`
- Create: `src/versions/v3/CardStack.jsx`
- Create: `src/versions/v3/TopNav.jsx`
- Create: `src/versions/v3/Sidebar.jsx`
- Create: `src/versions/v3/DetailView.jsx`
- Create: `src/versions/v3/Toast.jsx`

**Design Reference:**
- Palette: Pure white (#ffffff), pure black (#000000), red (#ff0000)
- Typography: font-mono, uppercase headings, tight letter-spacing
- Cards: Thick 3px black border, no rounding, no shadows, flat
- Login: Giant bold "MAILSWIPE" filling screen, underlined "CONNECT" link
- Stats: Large monospace numbers, black vertical line separators
- Detail: Full-bleed panel, thick black top border, monospace body
- Swipe overlays: Green underline KEEP, red background TRASH, blue text ARCHIVE
- Toast: Black background, white monospace, sharp corners

**Step 1: Build all 7 components**

Use the frontend-design skill. Key Tailwind:
- `font-mono uppercase tracking-tight`
- `border-[3px] border-black rounded-none`
- `shadow-none` everywhere
- No gradients, no blur, no rounding

**Step 2: Visual verification**

Run: `npm run dev`, navigate to `/3`
Verify: Stark black/white, monospace everywhere, thick borders, no decoration

**Step 3: Commit**

```bash
git add src/versions/v3/ && git commit -m "Add Version 3: Brutalist Mono"
```

---

### Task 5: Version 4 — Aurora Glass

**Files:**
- Create: `src/versions/v4/App.jsx`
- Create: `src/versions/v4/Card.jsx`
- Create: `src/versions/v4/CardStack.jsx`
- Create: `src/versions/v4/TopNav.jsx`
- Create: `src/versions/v4/Sidebar.jsx`
- Create: `src/versions/v4/DetailView.jsx`
- Create: `src/versions/v4/Toast.jsx`

**Design Reference:**
- Palette: Animated gradient mesh (teal #0d9488, violet #7c3aed, indigo #4f46e5, pink #ec4899)
- Typography: Light-weight sans-serif, clean/airy, white text on glass
- Cards: Frosted glass (bg-white/10 backdrop-blur-xl), thin white/20 border, iridescent shimmer
- Login: Full-screen animated gradient mesh, centered frosted glass card
- Stats: Frosted glass strip with white text, semi-transparent dividers
- Detail: Large frosted glass panel over gradient, white text
- Swipe overlays: Colored frosted tints (green/red/blue glass)
- Toast: Small frosted glass pill, white text

**Step 1: Build all 7 components**

Use the frontend-design skill. Key implementation details:
- Animated gradient mesh: Use CSS `@keyframes` with `background-position` animation on a multi-stop gradient, or 3-4 animated positioned blur circles
- `backdrop-blur-xl bg-white/10 border border-white/20` for glass effect
- All text is white or white/80 for hierarchy

**Step 2: Visual verification**

Run: `npm run dev`, navigate to `/4`
Verify: Animated colorful background, frosted glass everywhere, ethereal feel

**Step 3: Commit**

```bash
git add src/versions/v4/ && git commit -m "Add Version 4: Aurora Glass"
```

---

### Task 6: Version 5 — Newspaper / Editorial

**Files:**
- Create: `src/versions/v5/App.jsx`
- Create: `src/versions/v5/Card.jsx`
- Create: `src/versions/v5/CardStack.jsx`
- Create: `src/versions/v5/TopNav.jsx`
- Create: `src/versions/v5/Sidebar.jsx`
- Create: `src/versions/v5/DetailView.jsx`
- Create: `src/versions/v5/Toast.jsx`

**Design Reference:**
- Palette: Warm ivory (#faf8f2), rich black (#1a1a1a), deep red (#c41e3a), muted gold (#b8860b)
- Typography: Georgia/system-serif headings, small-caps labels, decorative rules/lines
- Cards: Ivory background, thin 1px black border, decorative red rule at top, no rounding
- Login: Newspaper masthead style, large serif italic title with decorative rules, "EST. 2024"
- Stats: Three serif columns with thin vertical rules, small-caps labels
- Detail: Editorial article layout, large serif headline, byline, dateline
- Swipe overlays: Elegant green banner KEEP, red stamp TRASH, blue serif ARCHIVE
- Toast: Thin black bar with serif text, red accent

**Step 1: Build all 7 components**

Use the frontend-design skill. Key Tailwind / styles:
- `font-serif` (add Georgia to tailwind config or use inline `fontFamily: 'Georgia, serif'`)
- `tracking-[0.15em] uppercase text-xs` for small-caps labels
- `border-t-2 border-[#c41e3a]` for red decorative rules
- `border-b border-black/10` for thin separators
- No rounding anywhere

**Step 2: Visual verification**

Run: `npm run dev`, navigate to `/5`
Verify: Serif typography, editorial feel, decorative rules, masthead login

**Step 3: Commit**

```bash
git add src/versions/v5/ && git commit -m "Add Version 5: Newspaper Editorial"
```

---

### Task 7: Final integration and polish

**Step 1: Update `src/index.css`**

Add any global utility classes needed across versions (e.g., text-shadow utilities, scrollbar styling, animation keyframes for aurora mesh).

**Step 2: Verify all routes work end-to-end**

Run: `npm run dev`
Navigate: `/` → picker works, `/1` through `/5` each render their full app shell.
Check: Login flow works on each version, swipe gestures work, detail view opens, undo toast appears.

**Step 3: Final commit**

```bash
git add -A && git commit -m "Polish and finalize all 5 UI versions"
```
