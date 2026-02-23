# Customizable Swipe Actions

## Problem

MailSwipe has three swipe actions: Trash (left), Archive (up), Keep (right). Archive and Keep are nearly identical — both remove from inbox, Keep just adds a `MailSwipe/Kept` label. This redundancy wastes a swipe direction. Users should be able to assign any meaningful Gmail action to any swipe direction.

## Solution

All three swipe directions (left, up, right) become user-configurable. Each direction maps to an **action preset** with a **customizable color**. A new Settings panel (accessed from TopNav) lets users configure this.

## Action Presets

| Preset | Gmail API Effect | Default Color | Stays in Inbox? |
|--------|-----------------|---------------|-----------------|
| Trash | `messages.trash()` | Red #dc2626 | No |
| Archive | `modify({ removeLabelIds: ['INBOX'] })` | Blue #2563eb | No |
| Custom Label | `modify({ removeLabelIds: ['INBOX'], addLabelIds: [id] })` | Green #16a34a | No |
| Star | `modify({ addLabelIds: ['STARRED'] })` | Amber #d97706 | Yes |
| Mark Read | `modify({ removeLabelIds: ['UNREAD'] })` | Slate #475569 | Yes |
| Spam | `modify({ addLabelIds: ['SPAM'], removeLabelIds: ['INBOX'] })` | Orange #ea580c | No |

### Custom Label Details

When "Custom Label" is selected, a text input appears for the label name. The app creates `MailSwipe/<name>` in Gmail (reusing the existing `ensureMailSwipeLabel` pattern). Undo reverses by removing the label and re-adding INBOX.

## Color Palette

10 curated colors — bold, high-contrast, functional with the brutalist mono aesthetic:

```
#dc2626  Red
#2563eb  Blue
#16a34a  Green
#d97706  Amber
#7c3aed  Violet
#475569  Slate
#ea580c  Orange
#0d9488  Teal
#e11d48  Rose
#000000  Black
```

Each preset has a suggested default color. Users can override to any of the 10.

## Data Model

```js
// localStorage key: 'mailswipe_settings'
{
  swipeActions: {
    left:  { type: 'trash',   label: 'Trash',   color: '#dc2626' },
    up:    { type: 'archive', label: 'Archive',  color: '#2563eb' },
    right: { type: 'label',   label: 'Kept',     color: '#16a34a', labelName: 'Kept' }
  }
}
```

Defaults match current behavior exactly — zero change for existing users until they customize.

## Settings UI

### Access Point

Gear icon in TopNav bar, between ML badge and user name. Opens a full-screen modal (same pattern as DetailView).

### Panel Layout

Centered card with brutalist styling (thick black border, white bg, monospace, uppercase headers).

Three sections, one per swipe direction:
1. Direction label (← LEFT / ↑ UP / → RIGHT)
2. Action dropdown — custom brutalist dropdown (not native select) with color squares
3. Color picker — row of 10 clickable squares, selected one gets 3px black outline
4. Conditional: if "Custom Label" is selected, text input for label name

Bottom buttons: SAVE & APPLY, RESET DEFAULTS.

### Action Dropdown

Expands to show all 6 presets with their default color indicator:

```
┌────────────────────────────────┐
│ ■ TRASH                        │
│ ■ ARCHIVE                      │
│ ■ STAR                         │
│ ■ MARK READ                    │
│ ■ SPAM                         │
│ ■ CUSTOM LABEL                 │
└────────────────────────────────┘
```

### Color Picker

Row of squares, selected gets thick outline:

```
┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐
│  ││  ││  ││  ││  ││  ││  ││  ││  ││  │
└──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘
```

## Dynamic Updates

When settings are saved, the following update everywhere:

- **Card swipe overlays** — show new action name and color
- **Sidebar stats** — labels and color squares reflect configured actions
- **Toast messages** — "EMAIL STARRED" instead of "EMAIL KEPT"
- **DetailView action buttons** — updated labels and colors
- **Keyboard hints** — ←/↑/→ remain, action names update

## Validation

- No two directions can have the same action+label combo
- Custom label names: alphanumeric + spaces, max 30 chars
- Switching presets auto-suggests the default color for that preset

## New Files

- `src/versions/v3/Settings.jsx` — Settings modal component
- `src/hooks/useSettings.js` — Settings state management (localStorage read/write, defaults)

## Modified Files

- `src/versions/v3/TopNav.jsx` — Add gear icon button
- `src/versions/v3/App.jsx` — Wire settings state, pass to all consumers
- `src/versions/v3/CardStack.jsx` — Read action config instead of hardcoded actions
- `src/versions/v3/Sidebar.jsx` — Dynamic labels/colors from settings
- `src/versions/v3/Toast.jsx` — Dynamic action names
- `src/versions/v3/DetailView.jsx` — Dynamic action buttons
- `src/gmail/api.js` — Add `starMessage`, `markReadMessage`, `spamMessage` + undo variants
- `src/hooks/useEmails.js` — Route actions through settings config, handle new action types

## Undo Support

All new actions must support undo (within the existing 4-second toast window):

| Action | Undo |
|--------|------|
| Trash | `messages.untrash()` |
| Archive | `modify({ addLabelIds: ['INBOX'] })` |
| Custom Label | `modify({ addLabelIds: ['INBOX'], removeLabelIds: [labelId] })` |
| Star | `modify({ removeLabelIds: ['STARRED'] })` |
| Mark Read | `modify({ addLabelIds: ['UNREAD'] })` |
| Spam | `modify({ removeLabelIds: ['SPAM'], addLabelIds: ['INBOX'] })` |
