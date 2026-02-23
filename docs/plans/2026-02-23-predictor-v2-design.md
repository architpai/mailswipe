# Swipe Predictor V2 — Card Tinting, Debug Settings, Landing Demo

## Goal

Replace default confidence pills with subtle card tinting at high confidence. Move pills behind an advanced settings debug toggle. Update landing page demo to explain prediction behavior with two tinted card examples.

## Change 1: Card Background Tinting

When the model's top prediction exceeds 80% confidence, tint the card background with the predicted action's color.

- Below 80%: white background (no change from current)
- 80-100%: tint opacity scales linearly from 0% to 12%
  - Formula: `opacity = (confidence - 0.8) / 0.2 * 0.12`
  - 80% = 0% opacity, 90% = 6%, 100% = 12%
- Color comes from `settings.swipeActions[predictedDirection].color`
- Only the top card gets tinted (background cards remain white)
- Works independently of the debug pills toggle

**Files:** `src/versions/v3/Card.jsx`

## Change 2: Advanced Settings with Debug Toggle

Add a collapsible "ADVANCED" section to the Settings modal with a toggle for showing confidence pills.

**New setting:** `showDebugPills: false` (default)

**Settings UI:**
- Collapsible section at the bottom of the settings body
- Button: `+ ADVANCED` (collapsed) / `- ADVANCED` (expanded)
- Collapsed by default
- Contains a single toggle: "SHOW CONFIDENCE DEBUG"
- Description text: "DISPLAY PREDICTION PILLS ON CARDS"
- Toggle: black-filled when on, border-only when off

**Data flow:**
- `useSettings` DEFAULT_SETTINGS gets `showDebugPills: false`
- Settings modal manages draft state for this toggle
- Card.jsx reads `settings.showDebugPills` to conditionally render PredictionPills
- Card tinting always active (not affected by this toggle)

**Files:** `src/hooks/useSettings.js`, `src/versions/v3/Settings.jsx`, `src/versions/v3/Card.jsx`

## Change 3: Landing Page Demo — Prediction Steps

Add two new demo steps after the 3 existing swipe demos to show prediction behavior.

**Step 4 — Predicted trash:**
- From: `DEALS@MEGASTORE.COM`
- Subject: `FLASH SALE 80% OFF`
- Snippet: `UNBELIEVABLE DEALS ON ELECTRONICS, FASHION AND MORE...`
- Tag: `SPAM`
- Card has red background tint from the start (demonstrating prediction)
- Swipes left (trash)
- Callout: `LEARNS AS YOU SWIPE.`

**Step 5 — Predicted keep:**
- From: `ALEX`
- Subject: `PARTY THIS SATURDAY!`
- Snippet: `HEY! THROWING A PARTY AT MY PLACE THIS WEEKEND. YOU IN?`
- Tag: `PERSONAL`
- Card has green background tint from the start
- Swipes right (keep)
- Callout: `SUGGESTS ACTIONS. YOU STAY IN CONTROL.`

**Full demo flow:** keep → trash → archive → predicted-trash(tinted) → predicted-keep(tinted) → pause(INBOX ZERO) → loop

**Files:** `src/versions/v3/App.jsx` (LandingPage, DEMO_STEPS)

## Files Changed

- **Modified:** `src/hooks/useSettings.js` — add `showDebugPills` to DEFAULT_SETTINGS
- **Modified:** `src/versions/v3/Settings.jsx` — add collapsible Advanced section with toggle
- **Modified:** `src/versions/v3/Card.jsx` — add tinting logic, gate pills on `showDebugPills`
- **Modified:** `src/versions/v3/App.jsx` — add 2 new DEMO_STEPS with tint color, update DemoCard
