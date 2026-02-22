# MailSwipe UI Redesign: 5 Visual Versions

## Overview
Create 5 radically different visual versions of the MailSwipe app, each accessible at routes `/1` through `/5`. All versions share the same business logic (hooks, Gmail API, ML) but have completely independent UI components.

## Architecture

### Shared Layer (unchanged)
- `src/hooks/useAuth.js` — Google OAuth
- `src/hooks/useEmails.js` — email fetching, actions, undo, stats
- `src/hooks/useML.js` — on-device ML for tagging/summarization
- `src/gmail/api.js` — Gmail API integration
- `src/utils/parser.js` — email header parsing
- `src/ml/worker.js` — ML web worker

### Routing
- Install `react-router-dom`
- `main.jsx` wraps `<BrowserRouter>` with `<Routes>`
- Route `/` — version picker page
- Routes `/1` through `/5` — each version's app shell

### Per-Version Structure
Each version lives in `src/versions/vN/` containing:
- `App.jsx` — main app shell (login + authenticated views)
- `Card.jsx` — email card component
- `CardStack.jsx` — swipeable card stack with overlays
- `TopNav.jsx` — navigation bar with ML status
- `Sidebar.jsx` — triage stats bar
- `DetailView.jsx` — full email detail view
- `Toast.jsx` — undo toast notification

### Version Picker (`/`)
Neutral grid page with 5 cards linking to each version. Each card shows theme name, brief description, and color preview.

---

## Version 1: Neon Noir (`/1`)

**Palette**: Deep black (#0a0a0f), electric blue (#00d4ff), hot pink (#ff2d7b), neon purple (#a855f7)

**Typography**: System sans-serif, bold headings with text-shadow glow

**Key elements**:
- Dark glass cards (#1a1a2e + backdrop-blur) with neon border glow
- Login: centered logo with neon glow pulse, dark background with subtle grid, glowing CTA
- Stats: neon-colored counters with glow, pill-shaped, dark glass background
- Detail: full-screen dark overlay, neon accent dividers
- Swipe overlays: neon green/red/blue glow effects
- Toast: dark glass with neon accent border

---

## Version 2: Soft Organic (`/2`)

**Palette**: Warm cream (#fdf6ee), peach (#ffb88c), sage (#a3b18a), lavender (#c8b6ff), warm brown (#6b4226)

**Typography**: Rounded feel with generous line-height, soft letter-spacing

**Key elements**:
- White cards with warm shadow, rounded-3xl, soft gradient top border
- Login: cream background with CSS blob shapes, welcoming text, pill-shaped peach gradient button
- Stats: soft pastel pills with matching warm icons
- Detail: slide-up sheet with extra-rounded top, warm cream header, gentle spring animations
- Swipe overlays: soft sage/coral/lavender
- Toast: warm brown with cream text, very rounded

---

## Version 3: Brutalist Mono (`/3`)

**Palette**: Pure white (#ffffff), pure black (#000000), red (#ff0000)

**Typography**: Monospace (font-mono), uppercase headings, tight letter-spacing

**Key elements**:
- Thick 3px black border cards, no rounding, no shadows, flat
- Login: giant bold "MAILSWIPE" filling screen, underlined "CONNECT" link, stark white
- Stats: large monospace numbers, black vertical line separators, no decoration
- Detail: full-bleed panel, thick black top border, monospace body, red close button
- Swipe overlays: green underline KEEP, red background TRASH, blue text ARCHIVE
- Toast: black background, white monospace, sharp corners, red undo

---

## Version 4: Aurora Glass (`/4`)

**Palette**: Animated gradient mesh (teal #0d9488, violet #7c3aed, indigo #4f46e5, pink #ec4899)

**Typography**: Light-weight sans-serif, clean/airy, white text on glass

**Key elements**:
- Frosted glass cards (bg-white/10 backdrop-blur-xl), thin white/20 border, iridescent shimmer
- Login: full-screen animated gradient mesh, centered frosted glass card, ethereal glow button
- Stats: frosted glass strip with white text, semi-transparent dividers
- Detail: large frosted glass panel over gradient, white text
- Swipe overlays: colored frosted tints (green/red/blue glass)
- Toast: small frosted glass pill, white text

---

## Version 5: Newspaper / Editorial (`/5`)

**Palette**: Warm ivory (#faf8f2), rich black (#1a1a1a), deep red (#c41e3a), muted gold (#b8860b)

**Typography**: Serif (Georgia/system-serif) headings, small-caps labels, decorative rules/lines

**Key elements**:
- Ivory cards with thin 1px black border, decorative red rule at top, no rounding
- Login: newspaper masthead style, large serif italic title, decorative rules, understated sign-in link
- Stats: three serif columns with thin vertical rules, small-caps labels
- Detail: editorial article layout, large serif headline, byline, dateline, flowing body
- Swipe overlays: elegant green banner KEEP, red stamp TRASH, blue serif ARCHIVE
- Toast: thin black bar with serif text, red accent
