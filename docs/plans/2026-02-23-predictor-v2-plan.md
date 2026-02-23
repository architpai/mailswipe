# Predictor V2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace default confidence pills with subtle card tinting at high confidence, move pills behind an advanced settings debug toggle, and update the landing page demo with two tinted prediction card examples.

**Architecture:** Three changes to the existing swipe predictor feature: (1) Card background tint driven by prediction confidence > 80%, (2) collapsible Advanced section in Settings with a debug pills toggle persisted in localStorage, (3) two new DEMO_STEPS in the landing page showing tinted cards.

**Tech Stack:** React, Tailwind CSS, Framer Motion, localStorage

**Design doc:** `docs/plans/2026-02-23-predictor-v2-design.md`

---

### Task 1: Add `showDebugPills` to DEFAULT_SETTINGS

**Files:**
- Modify: `src/hooks/useSettings.js:27-33`

**Step 1: Add the new setting**

In `src/hooks/useSettings.js`, change `DEFAULT_SETTINGS` from:

```js
export const DEFAULT_SETTINGS = {
    swipeActions: {
        left:  { type: 'trash',   color: '#dc2626' },
        up:    { type: 'archive', color: '#2563eb' },
        right: { type: 'label',   color: '#16a34a', labelName: 'Kept' },
    },
};
```

to:

```js
export const DEFAULT_SETTINGS = {
    swipeActions: {
        left:  { type: 'trash',   color: '#dc2626' },
        up:    { type: 'archive', color: '#2563eb' },
        right: { type: 'label',   color: '#16a34a', labelName: 'Kept' },
    },
    showDebugPills: false,
};
```

**Step 2: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/hooks/useSettings.js
git commit -m "feat: add showDebugPills setting (default false)"
```

---

### Task 2: Add card background tinting + gate pills on debug setting

**Files:**
- Modify: `src/versions/v3/Card.jsx:137-155`

This task replaces the default pill display with confidence-based card tinting, and gates the pills behind `settings.showDebugPills`.

**Step 1: Add tint computation helper**

Add this function before the `Card` export (before line 137), after the `PredictionPills` component:

```jsx
const CONFIDENCE_THRESHOLD = 0.8;
const MAX_TINT_OPACITY = 0.12;

function computeTintColor(predictions, settings) {
  if (!predictions || !settings) return null;
  const directions = ['left', 'up', 'right'];
  let maxDir = directions[0];
  let maxConf = predictions[directions[0]] || 0;
  for (const dir of directions) {
    const conf = predictions[dir] || 0;
    if (conf > maxConf) {
      maxConf = conf;
      maxDir = dir;
    }
  }
  if (maxConf < CONFIDENCE_THRESHOLD) return null;
  const opacity = ((maxConf - CONFIDENCE_THRESHOLD) / (1 - CONFIDENCE_THRESHOLD)) * MAX_TINT_OPACITY;
  const color = settings.swipeActions[maxDir].color;
  return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
}
```

**Step 2: Update Card component to use tinting and gate pills**

Change the Card's outer div (lines 151-155) from:

```jsx
  return (
    <div
      className={`w-full h-full border-[3px] border-black rounded-none shadow-none p-5 flex flex-col justify-between overflow-hidden bg-white font-mono
        ${isTop ? '' : 'opacity-80'}`}
    >
      <div>
        {/* Prediction confidence pills — only on top card */}
        {isTop && predictions && (
          <PredictionPills predictions={predictions} settings={settings} modelReady={modelReady} />
        )}
```

to:

```jsx
  const tintColor = isTop ? computeTintColor(predictions, settings) : null;

  return (
    <div
      className={`w-full h-full border-[3px] border-black rounded-none shadow-none p-5 flex flex-col justify-between overflow-hidden font-mono
        ${isTop ? '' : 'opacity-80'}`}
      style={{ backgroundColor: tintColor || '#ffffff' }}
    >
      <div>
        {/* Prediction confidence pills — only when debug enabled */}
        {isTop && predictions && settings?.showDebugPills && (
          <PredictionPills predictions={predictions} settings={settings} modelReady={modelReady} />
        )}
```

Note: `bg-white` is removed from className and replaced by the dynamic `style.backgroundColor`.

**Step 3: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/versions/v3/Card.jsx
git commit -m "feat: add confidence-based card tinting, gate pills on showDebugPills"
```

---

### Task 3: Add collapsible Advanced section to Settings modal

**Files:**
- Modify: `src/versions/v3/Settings.jsx:185-311`

**Step 1: Add showDebugPills to Settings draft state**

The Settings component currently manages `draft` as a clone of `settings.swipeActions`. We need to also track `showDebugPills` in the draft.

Update the `useState` initializer in Settings (line 186-189) from:

```jsx
  const [draft, setDraft] = useState(() => {
    // Deep clone the swipeActions from current settings
    return JSON.parse(JSON.stringify(settings.swipeActions));
  });
```

to:

```jsx
  const [draft, setDraft] = useState(() => ({
    swipeActions: JSON.parse(JSON.stringify(settings.swipeActions)),
    showDebugPills: settings.showDebugPills ?? false,
  }));
```

**Step 2: Update all draft references**

Since `draft` was previously just the swipeActions object, all references need to use `draft.swipeActions` now.

Update `handleDirectionChange` (line 200-206) from:

```jsx
  const handleDirectionChange = (dirKey, newConfig) => {
    setDraft((prev) => ({
      ...prev,
      [dirKey]: newConfig,
    }));
    setError('');
  };
```

to:

```jsx
  const handleDirectionChange = (dirKey, newConfig) => {
    setDraft((prev) => ({
      ...prev,
      swipeActions: {
        ...prev.swipeActions,
        [dirKey]: newConfig,
      },
    }));
    setError('');
  };
```

Update `handleSave` validation (lines 210-216) — change `draft[dir.key]` to `draft.swipeActions[dir.key]`:

```jsx
  const handleSave = () => {
    for (const dir of DIRECTION_CONFIG) {
      const cfg = draft.swipeActions[dir.key];
      if (cfg.type === 'label' && (!cfg.labelName || cfg.labelName.trim() === '')) {
        setError(`${dir.label} has Custom Label selected but no label name.`);
        return;
      }
    }

    const combos = DIRECTION_CONFIG.map((dir) => {
      const cfg = draft.swipeActions[dir.key];
      const combo = cfg.type === 'label' ? `label:${cfg.labelName.trim().toLowerCase()}` : cfg.type;
      return { dir: dir.label, combo };
    });
    for (let i = 0; i < combos.length; i++) {
      for (let j = i + 1; j < combos.length; j++) {
        if (combos[i].combo === combos[j].combo) {
          setError(`${combos[i].dir} and ${combos[j].dir} have the same action.`);
          return;
        }
      }
    }

    setError('');
    onSave({ ...settings, swipeActions: draft.swipeActions, showDebugPills: draft.showDebugPills });
    onClose();
  };
```

Update `handleReset` (lines 238-241) from:

```jsx
  const handleReset = () => {
    setDraft(JSON.parse(JSON.stringify(DEFAULT_SETTINGS.swipeActions)));
    setError('');
  };
```

to:

```jsx
  const handleReset = () => {
    setDraft({
      swipeActions: JSON.parse(JSON.stringify(DEFAULT_SETTINGS.swipeActions)),
      showDebugPills: DEFAULT_SETTINGS.showDebugPills ?? false,
    });
    setError('');
  };
```

Update DirectionSection config prop in the body (line 281) — change `draft[dir.key]` to `draft.swipeActions[dir.key]`:

```jsx
            {DIRECTION_CONFIG.map((dir) => (
              <DirectionSection
                key={dir.key}
                direction={dir}
                config={draft.swipeActions[dir.key]}
                onConfigChange={(newConfig) => handleDirectionChange(dir.key, newConfig)}
              />
            ))}
```

**Step 3: Add the collapsible Advanced section**

Add local state for the collapse toggle at the top of the Settings component (after the `error` state):

```jsx
  const [showAdvanced, setShowAdvanced] = useState(false);
```

Then add the Advanced section in the body, after the DirectionSection map and before the closing `</div>` of the scrollable body area (after line 284, before line 285):

```jsx
            {/* Advanced settings — collapsible */}
            <div className="mt-2 border-t-[2px] border-black/10 pt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(prev => !prev)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-black/40 hover:text-black/60 transition-colors bg-transparent border-none cursor-pointer font-mono p-0"
              >
                <span>{showAdvanced ? '−' : '+'}</span>
                <span>ADVANCED</span>
              </button>

              {showAdvanced && (
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-black/50">
                        SHOW CONFIDENCE DEBUG
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-black/30 mt-0.5">
                        DISPLAY PREDICTION PILLS ON CARDS
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDraft(prev => ({ ...prev, showDebugPills: !prev.showDebugPills }))}
                      className="flex-none w-10 h-5 border-[2px] border-black cursor-pointer p-0 transition-colors"
                      style={{ backgroundColor: draft.showDebugPills ? '#000' : '#fff' }}
                    >
                      <div
                        className="w-3 h-3 transition-transform"
                        style={{
                          backgroundColor: draft.showDebugPills ? '#fff' : '#000',
                          transform: draft.showDebugPills ? 'translateX(18px)' : 'translateX(2px)',
                        }}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
```

**Step 4: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/versions/v3/Settings.jsx
git commit -m "feat: add collapsible Advanced section with debug pills toggle"
```

---

### Task 4: Add prediction demo steps to landing page

**Files:**
- Modify: `src/versions/v3/App.jsx:16-62` (DEMO_STEPS array + DemoCard)

**Step 1: Add 2 new demo steps to DEMO_STEPS array**

In `src/versions/v3/App.jsx`, add two new entries to the `DEMO_STEPS` array (after the archive step, before the closing `];`):

After the archive step (line 55 `},`), add:

```js
  {
    from: 'DEALS@MEGASTORE.COM',
    subject: 'FLASH SALE 80% OFF',
    snippet: 'UNBELIEVABLE DEALS ON ELECTRONICS, FASHION AND MORE...',
    tag: 'SPAM',
    direction: 'left',
    exitX: -600,
    exitY: 0,
    exitRotate: -18,
    label: '← TRASH',
    labelColor: '#ff0000',
    callout: 'LEARNS AS YOU SWIPE.',
    tintColor: 'rgba(220, 38, 38, 0.10)',
  },
  {
    from: 'ALEX',
    subject: 'PARTY THIS SATURDAY!',
    snippet: 'HEY! THROWING A PARTY AT MY PLACE THIS WEEKEND. YOU IN?',
    tag: 'PERSONAL',
    direction: 'right',
    exitX: 600,
    exitY: 0,
    exitRotate: 18,
    label: 'KEEP →',
    labelColor: '#16a34a',
    callout: 'SUGGESTS ACTIONS. YOU STAY IN CONTROL.',
    tintColor: 'rgba(22, 163, 74, 0.10)',
  },
```

**Step 2: Update DemoCard to support tint color**

In the DemoCard component (line 68-69), update the outer `motion.div` to use the tint color:

Change from:

```jsx
      className="absolute w-[280px] sm:w-[320px] border-[3px] border-black bg-white p-5 select-none"
      style={{ fontFamily: 'monospace' }}
```

to:

```jsx
      className="absolute w-[280px] sm:w-[320px] border-[3px] border-black p-5 select-none"
      style={{ fontFamily: 'monospace', backgroundColor: step.tintColor || '#ffffff' }}
```

Note: `bg-white` removed from className, replaced by dynamic `style.backgroundColor`.

**Step 3: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/versions/v3/App.jsx
git commit -m "feat: add prediction demo steps with card tinting to landing page"
```

---

### Task 5: Verify build and manual testing

**Step 1: Full build check**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds with no errors

**Step 2: Manual verification checklist**

Start dev server: `npm run dev`

1. **Landing page**: Verify 5 demo cards cycle (keep → trash → archive → tinted-trash → tinted-keep → pause → loop). The 4th and 5th cards should have visible color tints.
2. **Card tinting**: After logging in and swiping 3+ emails, cards with >80% predicted confidence should show a subtle background color wash.
3. **Pills hidden by default**: Confidence pills should NOT appear on cards by default.
4. **Settings > Advanced**: Open Settings, click `+ ADVANCED`, toggle `SHOW CONFIDENCE DEBUG` on, save. Pills should now appear on cards.
5. **Toggle off**: Open Settings, toggle debug off, save. Pills disappear, tinting remains.
6. **Settings persistence**: Refresh page — debug toggle state persists from localStorage.
7. **Reset defaults**: Open Settings, click RESET DEFAULTS, save. Debug toggle should be off.

**Step 3: Commit any polish fixes**

```bash
git add -A
git commit -m "polish: adjust styling"
```

(Only if changes were made in step 2)
