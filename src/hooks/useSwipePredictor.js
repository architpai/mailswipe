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
  const modelRef = useRef(null);
  if (modelRef.current === null) {
    modelRef.current = loadModel();
  }
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
    if (!DIRECTIONS.includes(direction)) {
      console.warn(`useSwipePredictor.train: unknown direction "${direction}"`);
      return;
    }
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
