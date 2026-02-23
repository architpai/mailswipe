# Swipe Action Predictor — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add online learning logistic regression classifiers that predict swipe direction from email features, displayed as confidence pills on each card.

**Architecture:** Three one-vs-rest logistic regression classifiers (left/up/right) trained via online SGD. Features extracted from sender domain, sender name tokens, and subject keywords. Predictions displayed as colored pills on each card. Model state persisted in localStorage.

**Tech Stack:** React hooks, vanilla JS math (no ML library), Framer Motion for pill animations, localStorage for persistence.

**Design doc:** `docs/plans/2026-02-23-swipe-predictor-design.md`

---

### Task 1: Create feature branch

**Step 1: Create and switch to feature branch**

Run: `git checkout -b feature/swipe-predictor`
Expected: Switched to a new branch 'feature/swipe-predictor'

---

### Task 2: Build the `useSwipePredictor` hook — core ML engine

**Files:**
- Create: `src/hooks/useSwipePredictor.js`

This is the largest task. It contains all ML logic: feature extraction, logistic regression, SGD training, softmax prediction, and localStorage persistence.

**Step 1: Create `src/hooks/useSwipePredictor.js`**

```js
import { useState, useCallback, useRef } from 'react';

// ── Constants ────────────────────────────────────────────────────────
const STORAGE_KEY = 'mailswipe_predictor';
const DIRECTIONS = ['left', 'up', 'right'];
const MAX_VOCAB_SIZE = 500;
const LEARNING_RATE = 0.1;
const L2_LAMBDA = 0.001;
const MIN_SWIPES_FOR_PREDICTION = 3;

// Common English stop words to exclude from subject tokenization
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over',
  'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
  'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'just', 'because', 'but', 'and',
  'or', 'if', 'while', 'about', 'up', 'your', 'you', 'we', 'our', 'my',
  'me', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'he', 'she',
  're', 'fw', 'fwd',
]);

// ── Model state helpers ──────────────────────────────────────────────

function createEmptyModel() {
  const weights = {};
  const bias = {};
  for (const dir of DIRECTIONS) {
    weights[dir] = [];
    bias[dir] = 0;
  }
  return {
    weights,
    bias,
    vocabulary: {},
    vocabSize: 0,
    swipeCount: 0,
    version: 1,
  };
}

function loadModel() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.version === 1 && parsed.weights && parsed.vocabulary) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load predictor model from localStorage', err);
  }
  return createEmptyModel();
}

function saveModel(model) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
  } catch (err) {
    console.error('Failed to save predictor model to localStorage', err);
  }
}

// ── Feature extraction ───────────────────────────────────────────────

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9@._\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

function extractDomain(email) {
  if (!email) return null;
  const at = email.lastIndexOf('@');
  if (at === -1) return null;
  return 'domain:' + email.substring(at + 1).toLowerCase();
}

function extractFeatureTokens(email) {
  const tokens = [];

  // Sender domain
  const domain = extractDomain(email.from?.email);
  if (domain) tokens.push(domain);

  // Sender name tokens (prefixed to avoid collision with subject tokens)
  const nameTokens = tokenize(email.from?.name);
  for (const t of nameTokens) {
    tokens.push('from:' + t);
  }

  // Subject keyword tokens
  const subjectTokens = tokenize(email.subject);
  for (const t of subjectTokens) {
    tokens.push('subj:' + t);
  }

  return tokens;
}

function getOrAddFeatureIndices(tokens, model) {
  const indices = [];
  for (const token of tokens) {
    if (token in model.vocabulary) {
      indices.push(model.vocabulary[token]);
    } else if (model.vocabSize < MAX_VOCAB_SIZE) {
      const idx = model.vocabSize;
      model.vocabulary[token] = idx;
      model.vocabSize = idx + 1;
      // Extend weight vectors for all directions
      for (const dir of DIRECTIONS) {
        model.weights[dir].push(0);
      }
      indices.push(idx);
    }
    // If vocab is full, unseen tokens are ignored
  }
  return indices;
}

function featureIndicesToSparse(indices) {
  // Returns a Set of active feature indices (binary features)
  return new Set(indices);
}

// ── Logistic regression math ─────────────────────────────────────────

function sigmoid(z) {
  if (z > 500) return 1;
  if (z < -500) return 0;
  return 1 / (1 + Math.exp(-z));
}

function dotProduct(weights, activeIndices, bias) {
  let sum = bias;
  for (const idx of activeIndices) {
    sum += weights[idx] || 0;
  }
  return sum;
}

function softmax(logits) {
  const maxLogit = Math.max(...logits);
  const exps = logits.map(l => Math.exp(l - maxLogit));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sumExps);
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useSwipePredictor() {
  const modelRef = useRef(loadModel());
  const [swipeCount, setSwipeCount] = useState(modelRef.current.swipeCount);

  const predict = useCallback((email) => {
    const model = modelRef.current;

    // Cold start — not enough data
    if (model.swipeCount < MIN_SWIPES_FOR_PREDICTION) {
      return { left: 1 / 3, up: 1 / 3, right: 1 / 3 };
    }

    const tokens = extractFeatureTokens(email);
    const indices = [];
    for (const token of tokens) {
      if (token in model.vocabulary) {
        indices.push(model.vocabulary[token]);
      }
    }
    const active = featureIndicesToSparse(indices);

    // Raw logits from each classifier
    const logits = DIRECTIONS.map(dir =>
      dotProduct(model.weights[dir], active, model.bias[dir])
    );

    // Softmax to get probability distribution
    const probs = softmax(logits);

    const result = {};
    DIRECTIONS.forEach((dir, i) => {
      result[dir] = probs[i];
    });
    return result;
  }, []);

  const train = useCallback((email, direction) => {
    const model = modelRef.current;

    const tokens = extractFeatureTokens(email);
    const indices = getOrAddFeatureIndices(tokens, model);
    const active = featureIndicesToSparse(indices);

    // SGD update for each classifier
    for (const dir of DIRECTIONS) {
      const label = dir === direction ? 1 : 0;
      const logit = dotProduct(model.weights[dir], active, model.bias[dir]);
      const prediction = sigmoid(logit);
      const error = prediction - label;

      // Update weights for active features
      for (const idx of active) {
        model.weights[dir][idx] -= LEARNING_RATE * (error + L2_LAMBDA * model.weights[dir][idx]);
      }

      // Update bias
      model.bias[dir] -= LEARNING_RATE * error;
    }

    model.swipeCount += 1;
    setSwipeCount(model.swipeCount);
    saveModel(model);
  }, []);

  const resetModel = useCallback(() => {
    modelRef.current = createEmptyModel();
    setSwipeCount(0);
    saveModel(modelRef.current);
  }, []);

  return {
    predict,
    train,
    resetModel,
    modelReady: swipeCount >= MIN_SWIPES_FOR_PREDICTION,
    swipeCount,
  };
}
```

**Step 2: Verify file was created**

Run: `ls -la src/hooks/useSwipePredictor.js`
Expected: File exists

**Step 3: Commit**

```bash
git add src/hooks/useSwipePredictor.js
git commit -m "feat: add useSwipePredictor hook with logistic regression classifiers"
```

---

### Task 3: Add confidence pills UI to Card component

**Files:**
- Modify: `src/versions/v3/Card.jsx`

Add a `PredictionPills` component that renders three colored pills at the top of the card. The pills show abbreviated action names + confidence percentages, colored by each direction's configured color.

**Step 1: Add PredictionPills component and update Card props**

In `src/versions/v3/Card.jsx`, add this component before the existing `Card` export. Then add `predictions` and `settings` props to Card.

Add this component after the `MlTagBadge` component (after line 73):

```jsx
function PredictionPills({ predictions, settings, modelReady }) {
  if (!predictions || !settings) return null;

  // Before model is ready, show learning indicator
  if (!modelReady) {
    return (
      <div className="flex items-center justify-center mb-3">
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/30 font-mono">
          LEARNING...
        </span>
      </div>
    );
  }

  const directions = ['left', 'up', 'right'];

  // Find highest confidence direction
  const maxDir = directions.reduce((a, b) =>
    (predictions[a] || 0) > (predictions[b] || 0) ? a : b
  );

  // Build abbreviated label (first 3 chars uppercase)
  const getAbbrev = (actionConfig) => {
    let name;
    if (actionConfig.type === 'label') {
      name = actionConfig.labelName || 'Label';
    } else {
      const labels = { trash: 'Trash', archive: 'Archive', star: 'Star', read: 'Read', spam: 'Spam' };
      name = labels[actionConfig.type] || actionConfig.type;
    }
    return name.substring(0, 3).toUpperCase();
  };

  return (
    <div className="flex items-center gap-1.5 mb-3">
      {directions.map(dir => {
        const actionConfig = settings.swipeActions[dir];
        const confidence = predictions[dir] || 0;
        const isMax = dir === maxDir;
        const pct = Math.round(confidence * 100);

        return (
          <div
            key={dir}
            className="flex items-center gap-1 px-1.5 py-0.5 font-mono"
            style={{
              backgroundColor: actionConfig.color + (isMax ? '20' : '10'),
              border: `1.5px solid ${actionConfig.color}${isMax ? '60' : '25'}`,
              opacity: isMax ? 1 : 0.6,
            }}
          >
            <span
              className="text-[9px] font-bold uppercase tracking-tight"
              style={{ color: actionConfig.color }}
            >
              {getAbbrev(actionConfig)}
            </span>
            <span
              className="text-[9px] font-black tabular-nums"
              style={{ color: actionConfig.color }}
            >
              {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

**Step 2: Update Card component signature and add pills**

Change the Card export (currently at line 75) from:

```jsx
export default function Card({ email, isTop, onUnsubscribe }) {
```

to:

```jsx
export default function Card({ email, isTop, onUnsubscribe, predictions, settings, modelReady }) {
```

Then add the `PredictionPills` component inside the card, right after the opening `<div>` (after line 94 `<div>`), before the sender row:

```jsx
        {/* Prediction confidence pills — only on top card */}
        {isTop && predictions && (
          <PredictionPills predictions={predictions} settings={settings} modelReady={modelReady} />
        )}
```

**Step 3: Verify app still compiles**

Run: `cd /Users/paiarchit/random-musing/mailswipe && npm run build 2>&1 | tail -5`
Expected: Build succeeds (pills won't render yet since no predictions are passed)

**Step 4: Commit**

```bash
git add src/versions/v3/Card.jsx
git commit -m "feat: add PredictionPills component to Card"
```

---

### Task 4: Wire predictions through CardStack

**Files:**
- Modify: `src/versions/v3/CardStack.jsx`

Pass `predictions`, `settings`, and `modelReady` through to the top Card via SwipeableCard, and also to background cards (without predictions).

**Step 1: Update SwipeableCard props and Card call**

In `src/versions/v3/CardStack.jsx`, update the `SwipeableCard` component (line 18) to accept and pass through prediction props:

Change the SwipeableCard signature from:

```jsx
const SwipeableCard = forwardRef(function SwipeableCard({ email, onSwipe, onOpenDetail, onUnsubscribe, dragEnabled = true, settings }, ref) {
```

to:

```jsx
const SwipeableCard = forwardRef(function SwipeableCard({ email, onSwipe, onOpenDetail, onUnsubscribe, dragEnabled = true, settings, predictions, modelReady }, ref) {
```

Then update the Card render inside SwipeableCard (line 132) from:

```jsx
      <Card email={email} isTop={true} onUnsubscribe={onUnsubscribe} />
```

to:

```jsx
      <Card email={email} isTop={true} onUnsubscribe={onUnsubscribe} predictions={predictions} settings={settings} modelReady={modelReady} />
```

**Step 2: Update CardStack export to accept and pass prediction props**

Change the CardStack signature (line 167) from:

```jsx
export default function CardStack({ emails, onSwipe, onOpenDetail, onUnsubscribe, stats, fetchError, onRetry, dragEnabled = true, settings }) {
```

to:

```jsx
export default function CardStack({ emails, onSwipe, onOpenDetail, onUnsubscribe, stats, fetchError, onRetry, dragEnabled = true, settings, predictions, modelReady }) {
```

Then update the SwipeableCard usage (line 299-307) from:

```jsx
      <SwipeableCard
        key={emails[0].id}
        email={emails[0]}
        onSwipe={onSwipe}
        onOpenDetail={onOpenDetail}
        onUnsubscribe={onUnsubscribe}
        dragEnabled={dragEnabled}
        settings={settings}
      />
```

to:

```jsx
      <SwipeableCard
        key={emails[0].id}
        email={emails[0]}
        onSwipe={onSwipe}
        onOpenDetail={onOpenDetail}
        onUnsubscribe={onUnsubscribe}
        dragEnabled={dragEnabled}
        settings={settings}
        predictions={predictions}
        modelReady={modelReady}
      />
```

**Step 3: Verify build**

Run: `cd /Users/paiarchit/random-musing/mailswipe && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/versions/v3/CardStack.jsx
git commit -m "feat: pass prediction props through CardStack to Card"
```

---

### Task 5: Integrate useSwipePredictor into App.jsx

**Files:**
- Modify: `src/versions/v3/App.jsx`

Wire the hook: import it, call it, compute predictions for the top email, pass them to CardStack, and call `train()` on every swipe.

**Step 1: Add import**

At `src/versions/v3/App.jsx` line 12, after the useSettings import, add:

```js
import { useSwipePredictor } from '../../hooks/useSwipePredictor';
```

**Step 2: Call the hook**

Inside the `App` component (line 336), after the `useSettings` call (line 340), add:

```js
  const { predict, train, modelReady } = useSwipePredictor();
```

**Step 3: Compute predictions for the top email**

After the `emailsRef` assignment (line 346), add:

```js
  // Predict swipe action for the top email
  const topEmail = emails.length > 0 ? emails[0] : null;
  const predictions = topEmail ? predict(topEmail) : null;
```

**Step 4: Add train call to handleSwipe**

Update `handleSwipe` (line 356-360) from:

```js
  const handleSwipe = (email, direction) => {
    const actionConfig = settings.swipeActions[direction];
    handleAction(email, direction, actionConfig);
    setLastAction({ email, direction, actionConfig });
  };
```

to:

```js
  const handleSwipe = (email, direction) => {
    const actionConfig = settings.swipeActions[direction];
    handleAction(email, direction, actionConfig);
    setLastAction({ email, direction, actionConfig });
    train(email, direction);
  };
```

Also update `handleActionDetail` (line 362-367) from:

```js
  const handleActionDetail = (email, direction) => {
    const actionConfig = settings.swipeActions[direction];
    handleAction(email, direction, actionConfig);
    setLastAction({ email, direction, actionConfig });
    setSelectedEmail(null);
  };
```

to:

```js
  const handleActionDetail = (email, direction) => {
    const actionConfig = settings.swipeActions[direction];
    handleAction(email, direction, actionConfig);
    setLastAction({ email, direction, actionConfig });
    train(email, direction);
    setSelectedEmail(null);
  };
```

**Step 5: Pass predictions to CardStack**

Update the CardStack usage (around line 400-411) from:

```jsx
            <CardStack
              emails={emails}
              onSwipe={handleSwipe}
              onOpenDetail={(email) => setSelectedEmail(email)}
              onUnsubscribe={handleUnsubscribe}
              stats={stats}
              fetchError={fetchError}
              onRetry={loadMore}
              dragEnabled={!selectedEmail}
              settings={settings}
            />
```

to:

```jsx
            <CardStack
              emails={emails}
              onSwipe={handleSwipe}
              onOpenDetail={(email) => setSelectedEmail(email)}
              onUnsubscribe={handleUnsubscribe}
              stats={stats}
              fetchError={fetchError}
              onRetry={loadMore}
              dragEnabled={!selectedEmail}
              settings={settings}
              predictions={predictions}
              modelReady={modelReady}
            />
```

**Step 6: Verify build**

Run: `cd /Users/paiarchit/random-musing/mailswipe && npm run build 2>&1 | tail -5`
Expected: Build succeeds with no errors

**Step 7: Commit**

```bash
git add src/versions/v3/App.jsx
git commit -m "feat: wire useSwipePredictor into App — predict and train on swipes"
```

---

### Task 6: Manual verification and polish

**Step 1: Start dev server and verify**

Run: `cd /Users/paiarchit/random-musing/mailswipe && npm run dev`

Manual checks:
1. Cards display "LEARNING..." text before any swipes
2. After 3 swipes (one per direction), pills appear with percentages
3. Percentages sum to ~100% (rounding may cause +-1)
4. Highest confidence pill is visually emphasized (full opacity)
5. Pills use correct colors from settings
6. Pill labels match abbreviated action names
7. After several swipes of same type (e.g., newsletters → left), model starts predicting higher confidence for that direction on similar emails
8. Page refresh preserves model state (pills show same predictions)
9. No console errors

**Step 2: Adjust visual polish if needed**

Review pill sizing, spacing, and colors on actual email cards. Ensure they don't crowd the sender row or overlap with the mlTag badge.

**Step 3: Final commit**

```bash
git add -A
git commit -m "polish: adjust prediction pills styling"
```

(Only if changes were made in step 2)
