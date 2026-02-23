# Swipe Action Predictor — Design

## Goal

Evaluate whether an online learning model can predict user swipe actions from email features, to determine if further RL investment is warranted. Test feature — display confidence of each action on each card.

## Model Architecture

Three one-vs-rest logistic regression classifiers, one per swipe direction (left/up/right).

### Features

- **Sender domain** — extracted from email address, one-hot encoded
- **Sender name tokens** — tokenized into lowercase words, one-hot encoded
- **Subject keywords** — tokenized, stop words removed, one-hot encoded
- Dynamic vocabulary, capped at 500 tokens total

### Training

- Online SGD after each swipe (learning rate 0.1, L2 regularization)
- Swiped direction gets label=1 for its classifier, label=0 for the other two
- Runs on main thread — single dot product, <1ms per operation

### Prediction

- Run all 3 classifiers on email features to get raw logits
- Softmax normalization to produce probability distribution summing to 1
- These become the confidence percentages shown in the UI

### Cold Start

- Until user has made at least 3 swipes, show uniform 33/33/33 with "LEARNING..." indicator

## Direction-Based Model

The model predicts **swipe direction**, not action type. This is correct because:

- Users develop muscle memory per-direction
- If they remap left from trash to spam, they likely still swipe left for the same emails
- Settings changes only affect display labels, not model state
- Model self-corrects over time if behavior genuinely changes after remapping

## UI: Confidence Pills

Three colored pills displayed at the top of each card.

Each pill shows:
- Abbreviated action name (e.g., "TRA", "ARC", "KEP")
- Confidence percentage (e.g., "72%")
- Background: action's configured color at reduced opacity
- Text: action's full color

Visual behavior:
- Highest confidence pill gets full opacity + bolder treatment
- Other two pills are more subdued
- Below 3 swipes: "LEARNING..." placeholder
- Framer Motion transitions between cards

Design language: monospace, uppercase, letter-spacing, 3px black border — matches existing card aesthetic.

## Data Flow

### New Hook: `useSwipePredictor`

- Loads/saves model state from localStorage (`mailswipe_predictor` key)
- `predict(email)` returns `{ left: 0.33, up: 0.45, right: 0.22 }`
- `train(email, direction)` called after each swipe
- `modelReady` boolean (true after >= 3 swipes)

### Integration

1. Email loads in CardStack -> `predict(email)` returns confidences
2. Confidences passed as prop to Card component -> renders pills
3. User swipes -> existing handleSwipe calls `train(email, direction)` after action
4. Next card prediction reflects updated model

### Storage

`mailswipe_predictor` in localStorage:

```json
{
  "weights": { "left": [...], "up": [...], "right": [...] },
  "vocabulary": { "gmail.com": 0, "newsletter": 1 },
  "bias": { "left": 0, "up": 0, "right": 0 },
  "swipeCount": 42,
  "version": 1
}
```

Total model state stays under 50KB regardless of usage.

## Files Changed

- **New:** `src/hooks/useSwipePredictor.js` — model logic, feature extraction, localStorage persistence
- **Modified:** `src/versions/v3/Card.jsx` — render confidence pills
- **Modified:** `src/versions/v3/CardStack.jsx` — pass prediction props through
- **Modified:** `src/App.jsx` — wire hook, pass predictions + train callback
