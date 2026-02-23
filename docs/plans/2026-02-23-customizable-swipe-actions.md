# Customizable Swipe Actions — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make all three swipe directions (left, up, right) user-configurable with preset actions, custom labels, and custom colors via a Settings panel.

**Architecture:** A `useSettings` hook manages settings in localStorage. All UI components read action configs from settings rather than hardcoded values. Gmail API gets new action functions (star, markRead, spam). Settings UI is a full-screen modal matching the existing brutalist aesthetic.

**Tech Stack:** React, Framer Motion, Tailwind CSS, gapi-script (Gmail API), localStorage

---

### Task 1: Create useSettings Hook

**Files:**
- Create: `src/hooks/useSettings.js`

**Step 1: Create the settings hook with defaults, presets, and localStorage persistence**

```js
import { useState, useCallback } from 'react';

const STORAGE_KEY = 'mailswipe_settings';

export const ACTION_PRESETS = {
  trash:   { label: 'Trash',        pastTense: 'TRASHED',         defaultColor: '#dc2626' },
  archive: { label: 'Archive',      pastTense: 'ARCHIVED',        defaultColor: '#2563eb' },
  label:   { label: 'Custom Label', pastTense: 'LABELED',         defaultColor: '#16a34a' },
  star:    { label: 'Star',         pastTense: 'STARRED',         defaultColor: '#d97706' },
  read:    { label: 'Mark Read',    pastTense: 'MARKED READ',     defaultColor: '#475569' },
  spam:    { label: 'Spam',         pastTense: 'MARKED AS SPAM',  defaultColor: '#ea580c' },
};

export const COLOR_PALETTE = [
  { value: '#dc2626', name: 'Red' },
  { value: '#2563eb', name: 'Blue' },
  { value: '#16a34a', name: 'Green' },
  { value: '#d97706', name: 'Amber' },
  { value: '#7c3aed', name: 'Violet' },
  { value: '#475569', name: 'Slate' },
  { value: '#ea580c', name: 'Orange' },
  { value: '#0d9488', name: 'Teal' },
  { value: '#e11d48', name: 'Rose' },
  { value: '#000000', name: 'Black' },
];

export const DEFAULT_SETTINGS = {
  swipeActions: {
    left:  { type: 'trash',   color: '#dc2626' },
    up:    { type: 'archive', color: '#2563eb' },
    right: { type: 'label',   color: '#16a34a', labelName: 'Kept' },
  },
};

// Derive display label from action config
export function getActionLabel(actionConfig) {
  if (actionConfig.type === 'label') {
    return actionConfig.labelName || 'Labeled';
  }
  return ACTION_PRESETS[actionConfig.type]?.label || actionConfig.type;
}

// Derive past tense for toast messages
export function getActionPastTense(actionConfig) {
  if (actionConfig.type === 'label') {
    return `LABELED "${(actionConfig.labelName || '').toUpperCase()}"`;
  }
  return ACTION_PRESETS[actionConfig.type]?.pastTense || actionConfig.type.toUpperCase();
}

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults in case new fields were added
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, []);

  const resetSettings = useCallback(() => {
    updateSettings(DEFAULT_SETTINGS);
  }, [updateSettings]);

  return { settings, updateSettings, resetSettings };
}
```

**Step 2: Verify it loads**

Run: `npm run dev` and check console — no errors on import.

**Step 3: Commit**

```bash
git add src/hooks/useSettings.js
git commit -m "Add useSettings hook with action presets, color palette, localStorage persistence"
```

---

### Task 2: Add New Gmail API Functions

**Files:**
- Modify: `src/gmail/api.js`

**Step 1: Add star, markRead, spam actions + undo variants + generic label ensure**

Add these functions after the existing `unkeepMessage` (after line 153):

```js
// Star a message (keeps in inbox)
export const starMessage = async (id) => {
  return gapi.client.gmail.users.messages.modify({
    userId: 'me',
    id,
    addLabelIds: ['STARRED'],
  });
};

export const unstarMessage = async (id) => {
  return gapi.client.gmail.users.messages.modify({
    userId: 'me',
    id,
    removeLabelIds: ['STARRED'],
  });
};

// Mark as read (keeps in inbox)
export const markReadMessage = async (id) => {
  return gapi.client.gmail.users.messages.modify({
    userId: 'me',
    id,
    removeLabelIds: ['UNREAD'],
  });
};

export const unmarkReadMessage = async (id) => {
  return gapi.client.gmail.users.messages.modify({
    userId: 'me',
    id,
    addLabelIds: ['UNREAD'],
  });
};

// Move to spam
export const spamMessage = async (id) => {
  return gapi.client.gmail.users.messages.modify({
    userId: 'me',
    id,
    addLabelIds: ['SPAM'],
    removeLabelIds: ['INBOX'],
  });
};

export const unspamMessage = async (id) => {
  return gapi.client.gmail.users.messages.modify({
    userId: 'me',
    id,
    removeLabelIds: ['SPAM'],
    addLabelIds: ['INBOX'],
  });
};
```

**Step 2: Refactor `ensureMailSwipeLabel` to support arbitrary label names**

Replace the existing `ensureMailSwipeLabel` function (lines 156-196) with a more generic version:

```js
const PARENT_LABEL_NAME = 'MailSwipe';

// Cache of label name → label ID to avoid repeated API calls
const labelIdCache = {};

// Ensure the MailSwipe parent label exists, return its ID
const ensureParentLabel = async () => {
  if (labelIdCache[PARENT_LABEL_NAME]) return labelIdCache[PARENT_LABEL_NAME];

  const { result } = await gapi.client.gmail.users.labels.list({ userId: 'me' });
  const labels = result.labels || [];

  let parentLabel = labels.find(l => l.name === PARENT_LABEL_NAME);
  if (!parentLabel) {
    const response = await gapi.client.gmail.users.labels.create({
      userId: 'me',
      resource: {
        name: PARENT_LABEL_NAME,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
      }
    });
    parentLabel = response.result;
  }

  labelIdCache[PARENT_LABEL_NAME] = parentLabel.id;
  return parentLabel.id;
};

// Ensure a MailSwipe/<childName> label exists, return its ID
export const ensureMailSwipeLabel = async (childName = 'Kept') => {
  const fullName = `${PARENT_LABEL_NAME}/${childName}`;

  if (labelIdCache[fullName]) return labelIdCache[fullName];

  await ensureParentLabel();

  const { result } = await gapi.client.gmail.users.labels.list({ userId: 'me' });
  const labels = result.labels || [];

  let childLabel = labels.find(l => l.name === fullName);
  if (!childLabel) {
    const response = await gapi.client.gmail.users.labels.create({
      userId: 'me',
      resource: {
        name: fullName,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
      }
    });
    childLabel = response.result;
  }

  labelIdCache[fullName] = childLabel.id;
  return childLabel.id;
};
```

**Step 3: Commit**

```bash
git add src/gmail/api.js
git commit -m "Add star, markRead, spam Gmail actions with undo, genericize label management"
```

---

### Task 3: Refactor useEmails for Configurable Actions

**Files:**
- Modify: `src/hooks/useEmails.js`

**Step 1: Rewrite useEmails to accept settings and route actions generically**

The key changes:
- `handleAction` takes `(email, direction, actionConfig)` instead of `(email, action)`
- Stats track by direction (`left`, `up`, `right`) not by action name
- Action routing uses `actionConfig.type` to pick the right API call
- For `type: 'label'`, lazily ensures the label exists and caches the ID

Replace the entire file:

```js
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  fetchInboxMessages,
  archiveMessage, trashMessage, keepMessage,
  untrashMessage, unarchiveMessage, unkeepMessage,
  starMessage, unstarMessage,
  markReadMessage, unmarkReadMessage,
  spamMessage, unspamMessage,
  ensureMailSwipeLabel,
} from '../gmail/api';
import { parseEmailHeaders } from '../utils/parser';

// Execute the Gmail API action based on action config
async function executeAction(email, actionConfig) {
  switch (actionConfig.type) {
    case 'trash':
      return trashMessage(email.id);
    case 'archive':
      return archiveMessage(email.id);
    case 'label': {
      const labelId = await ensureMailSwipeLabel(actionConfig.labelName || 'Kept');
      return keepMessage(email.id, labelId);
    }
    case 'star':
      return starMessage(email.id);
    case 'read':
      return markReadMessage(email.id);
    case 'spam':
      return spamMessage(email.id);
    default:
      throw new Error(`Unknown action type: ${actionConfig.type}`);
  }
}

// Undo the Gmail API action
async function undoExecuteAction(email, actionConfig) {
  switch (actionConfig.type) {
    case 'trash':
      return untrashMessage(email.id);
    case 'archive':
      return unarchiveMessage(email.id);
    case 'label': {
      const labelId = await ensureMailSwipeLabel(actionConfig.labelName || 'Kept');
      return unkeepMessage(email.id, labelId);
    }
    case 'star':
      return unstarMessage(email.id);
    case 'read':
      return unmarkReadMessage(email.id);
    case 'spam':
      return unspamMessage(email.id);
    default:
      throw new Error(`Unknown action type: ${actionConfig.type}`);
  }
}

// Actions that remove from inbox (email disappears from triage)
const REMOVES_FROM_INBOX = new Set(['trash', 'archive', 'label', 'spam']);

export function useEmails(token) {
  const [emails, setEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageToken, setPageToken] = useState(null);
  const [stats, setStats] = useState({ left: 0, up: 0, right: 0, total: 0 });
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    setEmails([]);
    setPageToken(null);
    setStats({ left: 0, up: 0, right: 0, total: 0 });
    setFetchError(null);
  }, [token]);

  const loadMore = useCallback(async () => {
    if (!token || isLoading) return;
    setIsLoading(true);
    try {
      setFetchError(null);
      const response = await fetchInboxMessages(pageToken);
      const parsed = response.messages.map(parseEmailHeaders);
      setEmails(prev => {
        const existingIds = new Set(prev.map(e => e.id));
        const newEmails = parsed.filter(e => e.id && !existingIds.has(e.id));
        return [...prev, ...newEmails];
      });
      setPageToken(response.nextPageToken);
    } catch (err) {
      console.error('Failed to fetch emails', err);
      setFetchError(err.message || 'Failed to fetch emails');
    } finally {
      setIsLoading(false);
    }
  }, [token, pageToken, isLoading]);

  useEffect(() => {
    if (token && emails.length === 0 && !isLoading && pageToken === null) {
      loadMore();
    }
  }, [token, emails.length, isLoading, pageToken, loadMore]);

  useEffect(() => {
    if (token && emails.length > 0 && emails.length <= 5 && pageToken && !isLoading) {
      loadMore();
    }
  }, [emails.length, pageToken, isLoading, token, loadMore]);

  const handleAction = useCallback(async (email, direction, actionConfig) => {
    // Only remove from list if the action removes from inbox
    if (REMOVES_FROM_INBOX.has(actionConfig.type)) {
      setEmails(prev => prev.filter(e => e.id !== email.id));
    }

    setStats(prev => ({
      ...prev,
      [direction]: (prev[direction] || 0) + 1,
      total: prev.total + 1,
    }));

    try {
      await executeAction(email, actionConfig);
    } catch (error) {
      console.error(`Failed to ${actionConfig.type} message ${email.id}`, error);
    }
  }, []);

  const undoAction = useCallback(async (email, direction, actionConfig) => {
    if (REMOVES_FROM_INBOX.has(actionConfig.type)) {
      setEmails(prev => [email, ...prev]);
    }

    setStats(prev => ({
      ...prev,
      [direction]: Math.max(0, (prev[direction] || 0) - 1),
      total: Math.max(0, prev.total - 1),
    }));

    try {
      await undoExecuteAction(email, actionConfig);
    } catch (err) {
      console.error('Undo failed:', err);
    }
  }, []);

  return { emails, setEmails, isLoading, stats, loadMore, handleAction, undoAction, fetchError };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useEmails.js
git commit -m "Refactor useEmails for configurable actions with direction-based stats"
```

---

### Task 4: Create Settings Modal Component

**Files:**
- Create: `src/versions/v3/Settings.jsx`

**Step 1: Build the full Settings modal**

This is the largest component. It includes:
- Full-screen modal with brutalist styling
- Three direction sections (left, up, right)
- Custom dropdown per direction showing action presets
- Color picker row per direction
- Conditional label name input when "Custom Label" is selected
- Save & Reset buttons
- Validation (no duplicate action+label combos)

```jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ACTION_PRESETS, COLOR_PALETTE, DEFAULT_SETTINGS, getActionLabel } from '../../hooks/useSettings';

const DIRECTIONS = [
  { key: 'left',  symbol: '←', label: 'LEFT SWIPE' },
  { key: 'up',    symbol: '↑', label: 'UP SWIPE' },
  { key: 'right', symbol: '→', label: 'RIGHT SWIPE' },
];

const ACTION_TYPES = Object.keys(ACTION_PRESETS);

function ActionDropdown({ value, onChange, directionKey }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 border-[3px] border-black bg-white font-mono text-xs font-black uppercase tracking-tight cursor-pointer hover:bg-black/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 flex-none" style={{ backgroundColor: ACTION_PRESETS[value]?.defaultColor || '#000' }} />
          <span>{ACTION_PRESETS[value]?.label || value}</span>
        </div>
        <span className="text-black/40">{open ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 w-full mt-[-3px] border-[3px] border-black bg-white"
          >
            {ACTION_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => { onChange(type); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-black uppercase tracking-tight cursor-pointer border-none font-mono transition-colors ${
                  value === type ? 'bg-black text-white' : 'bg-white text-black hover:bg-black/5'
                }`}
              >
                <div
                  className="w-3 h-3 flex-none"
                  style={{ backgroundColor: value === type ? '#fff' : ACTION_PRESETS[type].defaultColor }}
                />
                {ACTION_PRESETS[type].label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ColorPicker({ value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {COLOR_PALETTE.map(({ value: color, name }) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          title={name}
          className="w-7 h-7 cursor-pointer border-none p-0 transition-transform hover:scale-110"
          style={{
            backgroundColor: color,
            outline: value === color ? '3px solid black' : '1px solid rgba(0,0,0,0.15)',
            outlineOffset: value === color ? '2px' : '0px',
          }}
        />
      ))}
    </div>
  );
}

function DirectionConfig({ direction, config, onChange }) {
  const handleTypeChange = (type) => {
    const newConfig = {
      type,
      color: ACTION_PRESETS[type].defaultColor,
    };
    if (type === 'label') {
      newConfig.labelName = '';
    }
    onChange(newConfig);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg font-black">{direction.symbol}</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/50">{direction.label}</span>
      </div>

      <ActionDropdown
        value={config.type}
        onChange={handleTypeChange}
        directionKey={direction.key}
      />

      <div>
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/40 mb-1.5 block">COLOR</span>
        <ColorPicker value={config.color} onChange={(color) => onChange({ ...config, color })} />
      </div>

      {config.type === 'label' && (
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/40 mb-1.5 block">LABEL NAME</span>
          <input
            type="text"
            value={config.labelName || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 30);
              onChange({ ...config, labelName: val });
            }}
            placeholder="e.g. Important"
            className="w-full px-3 py-2 border-[3px] border-black bg-white font-mono text-xs font-bold uppercase tracking-tight outline-none placeholder:text-black/20 focus:border-black"
          />
          {config.labelName && (
            <span className="text-[9px] text-black/30 font-bold uppercase tracking-wider mt-1 block">
              CREATES: MAILSWIPE/{config.labelName.toUpperCase()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function Settings({ settings, onSave, onReset, onClose }) {
  const [draft, setDraft] = useState(settings.swipeActions);
  const [error, setError] = useState('');

  const handleDirectionChange = (dirKey, newConfig) => {
    setDraft(prev => ({ ...prev, [dirKey]: newConfig }));
    setError('');
  };

  const validate = () => {
    // Check for label actions with empty names
    for (const dir of DIRECTIONS) {
      const cfg = draft[dir.key];
      if (cfg.type === 'label' && !cfg.labelName?.trim()) {
        return `${dir.label} has Custom Label selected but no label name`;
      }
    }

    // Check for duplicate action+label combos
    const keys = DIRECTIONS.map(d => {
      const cfg = draft[d.key];
      return cfg.type === 'label' ? `label:${cfg.labelName}` : cfg.type;
    });
    const seen = new Set();
    for (let i = 0; i < keys.length; i++) {
      if (seen.has(keys[i])) {
        return `Two swipe directions can't have the same action`;
      }
      seen.add(keys[i]);
    }

    return '';
  };

  const handleSave = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    onSave({ ...settings, swipeActions: draft });
    onClose();
  };

  const handleReset = () => {
    setDraft(DEFAULT_SETTINGS.swipeActions);
    setError('');
  };

  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute inset-0 flex flex-col bg-white sm:mt-16 sm:h-[calc(100vh-4rem)] sm:max-w-md sm:mx-auto border-t-[3px] border-black font-mono"
      >
        {/* Header */}
        <div className="flex-none p-4 flex items-center justify-between bg-white border-b-[3px] border-black">
          <span className="font-black text-sm text-black uppercase tracking-tight">SETTINGS</span>
          <button
            onClick={onClose}
            className="text-[#ff0000] font-black text-2xl leading-none hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer font-mono"
          >
            X
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/40 mb-4 block">
              SWIPE ACTIONS
            </span>
            <p className="text-[9px] text-black/30 font-bold uppercase tracking-wider mb-5 leading-relaxed">
              ASSIGN AN ACTION AND COLOR TO EACH SWIPE DIRECTION
            </p>
          </div>

          {DIRECTIONS.map((dir, i) => (
            <React.Fragment key={dir.key}>
              {i > 0 && <div className="border-t-[2px] border-black/10" />}
              <DirectionConfig
                direction={dir}
                config={draft[dir.key]}
                onChange={(cfg) => handleDirectionChange(dir.key, cfg)}
              />
            </React.Fragment>
          ))}
        </div>

        {/* Footer */}
        <div className="flex-none p-4 pb-8 sm:pb-4 border-t-[3px] border-black bg-white space-y-2">
          {error && (
            <div className="text-[10px] font-bold text-[#ff0000] uppercase tracking-wider text-center py-1">
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            className="w-full py-3 bg-black text-white font-black border-none text-xs uppercase tracking-widest cursor-pointer font-mono hover:bg-black/80 transition-colors"
          >
            SAVE & APPLY
          </button>
          <button
            onClick={handleReset}
            className="w-full py-3 bg-white text-black font-black border-[3px] border-black text-xs uppercase tracking-widest cursor-pointer font-mono hover:bg-black/5 transition-colors"
          >
            RESET DEFAULTS
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

**Step 2: Commit**

```bash
git add src/versions/v3/Settings.jsx
git commit -m "Add Settings modal with action dropdowns, color picker, label input"
```

---

### Task 5: Update TopNav with Settings Gear Icon

**Files:**
- Modify: `src/versions/v3/TopNav.jsx:108-126`

**Step 1: Add gear icon button and onOpenSettings prop**

Change the component signature to accept `onOpenSettings`:

```jsx
export default function TopNav({ userProfile, onLogout, mlStatus, mlProgress, onOpenSettings }) {
```

Add the gear button in the right section, between the ML badge and the user info. Insert a settings button after `{renderMlBadge()}` (line 109):

```jsx
<div className="flex items-center gap-4">
  {renderMlBadge()}

  {userProfile && (
    <button
      onClick={onOpenSettings}
      className="text-black hover:text-[#ff0000] transition-colors bg-transparent border-none cursor-pointer p-0"
      title="Settings"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
        <path d="M6.5 1h3v2.1a5 5 0 011.2.7L12.5 2.4l2.1 2.1-1.4 1.8a5 5 0 01.7 1.2H16v3h-2.1a5 5 0 01-.7 1.2l1.4 1.8-2.1 2.1-1.8-1.4a5 5 0 01-1.2.7V16h-3v-2.1a5 5 0 01-1.2-.7L3.5 14.6l-2.1-2.1 1.4-1.8a5 5 0 01-.7-1.2H0v-3h2.1a5 5 0 01.7-1.2L1.4 3.5l2.1-2.1 1.8 1.4a5 5 0 011.2-.7V1z" />
        <circle cx="8" cy="8" r="2" />
      </svg>
    </button>
  )}

  {userProfile ? (
    ...existing user profile section...
  ) : (
    ...existing not connected section...
  )}
</div>
```

Note: The gear SVG should be a simple, blocky, brutalist gear icon. If the inline SVG is too complex, use a simpler approach — a square button with the text "⚙" or use lucide-react's `Settings` icon since it's already a dependency:

```jsx
import { Settings as SettingsIcon } from 'lucide-react';

// Then in the JSX:
<button
  onClick={onOpenSettings}
  className="text-black hover:text-[#ff0000] transition-colors bg-transparent border-none cursor-pointer p-0"
  title="Settings"
>
  <SettingsIcon size={16} strokeWidth={2.5} />
</button>
```

Prefer the lucide-react approach since it's already in the project's dependencies.

**Step 2: Commit**

```bash
git add src/versions/v3/TopNav.jsx
git commit -m "Add settings gear icon to TopNav"
```

---

### Task 6: Update CardStack for Dynamic Overlays

**Files:**
- Modify: `src/versions/v3/CardStack.jsx`

**Step 1: Accept settings prop and use it for overlay labels/colors**

Add `settings` to CardStack and SwipeableCard props. The key changes:

1. SwipeableCard receives `settings` and uses action labels/colors from settings for overlays
2. `flyOut` passes direction instead of hardcoded action name — the mapping happens in App
3. Overlay text and background colors come from `settings.swipeActions`

In SwipeableCard, change the `flyOut` callback (line 48-62):

```jsx
const flyOut = useCallback((direction, velocityX = 0, velocityY = 0) => {
  if (swiped.current) return;
  swiped.current = true;

  const exitX = direction === 'right' ? 600 : direction === 'left' ? -600 : 0;
  const exitY = direction === 'up' ? -600 : 0;

  animate(x, exitX, { type: 'spring', velocity: velocityX, stiffness: 80, damping: 20 });
  animate(y, exitY, { type: 'spring', velocity: velocityY, stiffness: 80, damping: 20 });

  setTimeout(() => onSwipe(email, direction), 150);
}, [email, onSwipe, x, y]);
```

Note: `onSwipe` now receives `direction` ('left'/'up'/'right') instead of `action` ('keep'/'trash'/'archive'). App.jsx will look up the action config from settings.

Change the overlay divs (lines 135-172) to use settings colors and labels:

```jsx
{/* Right swipe overlay */}
<motion.div
  className="absolute inset-0 flex items-center justify-center pointer-events-none"
  style={{
    opacity: keepOpacity,
    backgroundColor: `${settings.swipeActions.right.color}dd`,
  }}
>
  <span
    className="font-mono font-black text-5xl tracking-tighter uppercase"
    style={{ color: '#faf9f6', transform: 'rotate(-12deg)' }}
  >
    {getActionLabel(settings.swipeActions.right)}
  </span>
</motion.div>

{/* Left swipe overlay */}
<motion.div
  className="absolute inset-0 flex items-center justify-center pointer-events-none"
  style={{
    opacity: trashOpacity,
    backgroundColor: `${settings.swipeActions.left.color}dd`,
  }}
>
  <span
    className="font-mono font-black text-5xl tracking-tighter uppercase"
    style={{ color: '#faf9f6', transform: 'rotate(-12deg)' }}
  >
    {getActionLabel(settings.swipeActions.left)}
  </span>
</motion.div>

{/* Up swipe overlay */}
<motion.div
  className="absolute inset-0 flex items-center justify-center pointer-events-none"
  style={{
    opacity: archiveOpacity,
    backgroundColor: `${settings.swipeActions.up.color}dd`,
  }}
>
  <span
    className="font-mono font-black text-5xl tracking-tighter uppercase"
    style={{ color: '#faf9f6', transform: 'rotate(-12deg)' }}
  >
    {getActionLabel(settings.swipeActions.up)}
  </span>
</motion.div>
```

Also update the "inbox zero" stats summary (lines 266-280) to use settings colors:

```jsx
{triaged && (
  <motion.div ...>
    <div className="flex items-center gap-1.5 px-3 py-2">
      <div className="w-2 h-2" style={{ backgroundColor: settings.swipeActions.right.color }} />
      <span className="text-xs font-black tabular-nums">{stats.right || 0}</span>
    </div>
    <div className="border-l-[2px] border-black/15" />
    <div className="flex items-center gap-1.5 px-3 py-2">
      <div className="w-2 h-2" style={{ backgroundColor: settings.swipeActions.up.color }} />
      <span className="text-xs font-black tabular-nums">{stats.up || 0}</span>
    </div>
    <div className="border-l-[2px] border-black/15" />
    <div className="flex items-center gap-1.5 px-3 py-2">
      <div className="w-2 h-2" style={{ backgroundColor: settings.swipeActions.left.color }} />
      <span className="text-xs font-black tabular-nums">{stats.left || 0}</span>
    </div>
  </motion.div>
)}
```

Import `getActionLabel` at the top:
```jsx
import { getActionLabel } from '../../hooks/useSettings';
```

**Step 2: Commit**

```bash
git add src/versions/v3/CardStack.jsx
git commit -m "Update CardStack overlays and stats to use dynamic settings"
```

---

### Task 7: Update Sidebar for Dynamic Labels

**Files:**
- Modify: `src/versions/v3/Sidebar.jsx`

**Step 1: Accept settings prop and render dynamic labels/colors**

Replace the entire component to use settings for labels and colors:

```jsx
import React from 'react';
import { getActionLabel } from '../../hooks/useSettings';

export default function Sidebar({ stats, settings }) {
  const directions = [
    { key: 'left', symbol: '←' },
    { key: 'up', symbol: '↑' },
    { key: 'right', symbol: '→' },
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-white flex items-stretch mb-4 select-none font-mono border-[3px] border-black">
      {directions.map((dir, i) => {
        const actionConfig = settings.swipeActions[dir.key];
        return (
          <React.Fragment key={dir.key}>
            {i > 0 && <div className="border-l-[2px] border-black/15" />}
            <div className="flex-1 flex items-center justify-center gap-2 py-3">
              <div className="w-3 h-3 flex-none" style={{ backgroundColor: actionConfig.color }} />
              <div className="flex flex-col">
                <span className="text-xl font-black text-black tabular-nums leading-none">
                  {stats[dir.key] || 0}
                </span>
                <span className="text-[9px] text-black/40 font-bold uppercase tracking-widest">
                  {getActionLabel(actionConfig).toUpperCase()}
                </span>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/versions/v3/Sidebar.jsx
git commit -m "Update Sidebar to use dynamic settings for labels and colors"
```

---

### Task 8: Update Toast for Dynamic Action Names

**Files:**
- Modify: `src/versions/v3/Toast.jsx`

**Step 1: Use actionConfig from lastAction for display text**

The `lastAction` object will now include `{ email, direction, actionConfig }`. Update the toast text:

```jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActionPastTense } from '../../hooks/useSettings';

export default function Toast({ lastAction, onUndo, onDismiss }) {
  useEffect(() => {
    if (lastAction) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [lastAction, onDismiss]);

  return (
    <AnimatePresence>
      {lastAction && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-4 py-3 rounded-none shadow-none border-none flex items-center justify-between gap-4 w-11/12 max-w-sm font-mono"
        >
          <span className="font-bold text-xs uppercase tracking-tight">
            EMAIL {getActionPastTense(lastAction.actionConfig)}
          </span>
          <button
            onClick={() => {
              onUndo(lastAction);
              onDismiss();
            }}
            className="font-black text-xs uppercase tracking-tight text-[#ff0000] border-[2px] border-[#ff0000] px-3 py-1 rounded-none bg-transparent hover:bg-[#ff0000] hover:text-white transition-colors cursor-pointer font-mono"
          >
            UNDO
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Step 2: Commit**

```bash
git add src/versions/v3/Toast.jsx
git commit -m "Update Toast to show dynamic action names from settings"
```

---

### Task 9: Update DetailView for Dynamic Action Buttons

**Files:**
- Modify: `src/versions/v3/DetailView.jsx:137-157`

**Step 1: Accept settings prop and render dynamic action buttons**

Change the component signature:
```jsx
export default function DetailView({ email, onClose, onAction, onUnsubscribe, settings }) {
```

Replace the action buttons section (lines 138-157) with dynamic buttons:

```jsx
{/* Action buttons */}
<div className="flex-none p-4 pb-8 sm:pb-4 border-t-[3px] border-black bg-white flex justify-between gap-2">
  {['left', 'up', 'right'].map((dir) => {
    const actionConfig = settings.swipeActions[dir];
    return (
      <button
        key={dir}
        onClick={() => onAction(email, dir)}
        className="flex-1 py-3 bg-white text-black font-black border-[3px] border-black rounded-none flex items-center justify-center gap-1 active:scale-95 transition-all font-mono text-xs uppercase tracking-tight"
        style={{
          '--hover-bg': actionConfig.color,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = actionConfig.color;
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.borderColor = actionConfig.color;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#fff';
          e.currentTarget.style.color = '#000';
          e.currentTarget.style.borderColor = '#000';
        }}
      >
        {getActionLabel(actionConfig)}
      </button>
    );
  })}
</div>
```

Import at the top:
```jsx
import { getActionLabel } from '../../hooks/useSettings';
```

**Step 2: Commit**

```bash
git add src/versions/v3/DetailView.jsx
git commit -m "Update DetailView action buttons to use dynamic settings"
```

---

### Task 10: Wire Everything Together in App.jsx

**Files:**
- Modify: `src/versions/v3/App.jsx`

**Step 1: Import and integrate useSettings, Settings modal, and update all prop passing**

Add imports:
```jsx
import Settings from './Settings';
import { useSettings } from '../../hooks/useSettings';
```

Add state in the App component (after existing hooks around line 337):
```jsx
const { settings, updateSettings, resetSettings } = useSettings();
const [showSettings, setShowSettings] = useState(false);
```

Update `handleSwipe` to pass direction and look up action config (lines 352-355):
```jsx
const handleSwipe = (email, direction) => {
  const actionConfig = settings.swipeActions[direction];
  handleAction(email, direction, actionConfig);
  setLastAction({ email, direction, actionConfig });
};
```

Update `handleActionDetail` for DetailView actions (lines 357-360):
```jsx
const handleActionDetail = (email, direction) => {
  const actionConfig = settings.swipeActions[direction];
  handleAction(email, direction, actionConfig);
  setLastAction({ email, direction, actionConfig });
  setSelectedEmail(null);
};
```

Update `handleUnsubscribe` (lines 362-369):
```jsx
const handleUnsubscribe = (email) => {
  if (email.unsubscribeLink?.startsWith('http')) {
    window.open(email.unsubscribeLink, '_blank', 'noopener,noreferrer');
  } else {
    alert('Mailto unsubscribe not fully implemented yet.');
  }
  // Find which direction has trash, default to left
  const trashDir = Object.entries(settings.swipeActions).find(([_, cfg]) => cfg.type === 'trash')?.[0] || 'left';
  const actionConfig = settings.swipeActions[trashDir];
  handleAction(email, trashDir, actionConfig);
};
```

Update TopNav to pass `onOpenSettings`:
```jsx
<TopNav
  userProfile={userProfile}
  onLogout={logout}
  mlStatus={mlStatus}
  mlProgress={mlProgress}
  onOpenSettings={() => setShowSettings(true)}
/>
```

Update Sidebar to pass settings:
```jsx
<Sidebar stats={stats} settings={settings} />
```

Update CardStack to pass settings:
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

Update DetailView to pass settings:
```jsx
<DetailView
  email={selectedEmail}
  onClose={() => setSelectedEmail(null)}
  onAction={handleActionDetail}
  onUnsubscribe={handleUnsubscribe}
  settings={settings}
/>
```

Update Toast's onUndo to pass all three args:
```jsx
<Toast
  lastAction={lastAction}
  onUndo={({ email, direction, actionConfig }) => undoAction(email, direction, actionConfig)}
  onDismiss={() => setLastAction(null)}
/>
```

Add the Settings modal (after Toast, before closing `</div>`):
```jsx
<AnimatePresence>
  {showSettings && (
    <Settings
      settings={settings}
      onSave={updateSettings}
      onReset={resetSettings}
      onClose={() => setShowSettings(false)}
    />
  )}
</AnimatePresence>
```

**Step 2: Commit**

```bash
git add src/versions/v3/App.jsx
git commit -m "Wire settings to all components, add settings modal toggle"
```

---

### Task 11: Manual Verification

**Step 1: Start dev server and verify**

Run: `npm run dev`

Test checklist:
- [ ] App loads without errors
- [ ] Default behavior (trash/archive/keep) works identically to before
- [ ] Gear icon appears in TopNav after login
- [ ] Clicking gear opens Settings modal
- [ ] Each direction shows dropdown, color picker
- [ ] Changing action type updates the dropdown and auto-suggests color
- [ ] Selecting "Custom Label" shows label name input
- [ ] Save applies changes — swipe overlays show new labels and colors
- [ ] Sidebar reflects new action names and colors
- [ ] DetailView buttons reflect new action names
- [ ] Toast shows correct past tense for each action type
- [ ] Undo works for all action types
- [ ] Settings persist across page refresh (localStorage)
- [ ] Reset Defaults restores original trash/archive/keep config
- [ ] Validation: empty label name prevented, duplicate actions prevented
- [ ] Star action keeps email in inbox (doesn't remove from card stack — wait, actually it should still remove from stack since the user triaged it)

**Step 2: Fix the "stays in inbox" actions**

For Star and Mark Read, the email stays in Gmail inbox but should still be removed from the MailSwipe card stack (user has triaged it). The current `REMOVES_FROM_INBOX` set in `useEmails.js` controls this. Since all swiped cards should disappear from the triage stack regardless of action, change `handleAction` to always remove from the email list:

In `useEmails.js`, change:
```js
// Always remove from triage stack — user has made a decision
setEmails(prev => prev.filter(e => e.id !== email.id));
```

And in `undoAction`:
```js
// Always re-add to stack on undo
setEmails(prev => [email, ...prev]);
```

Remove the `REMOVES_FROM_INBOX` set entirely.

**Step 3: Final commit**

```bash
git add -A
git commit -m "Fix: always remove swiped emails from triage stack regardless of action type"
```
